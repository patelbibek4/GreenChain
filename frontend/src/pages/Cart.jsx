import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8001";


function Cart() {

  const navigate = useNavigate();

  const {
    user,
    isLoggedIn,
  } = useAuth();


  const [cartItems, setCartItems] =
    useState([]);

  const [subtotal, setSubtotal] =
    useState(0);

  const [totalItems, setTotalItems] =
    useState(0);


  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState(null);

  const [error, setError] =
    useState("");


  /* =========================================================
     LOAD CART
     ========================================================= */

  const loadCart = async () => {

    try {

      setLoading(true);
      setError("");


      const response =
        await api.get("/cart/");


      console.log(
        "Cart response:",
        response.data
      );


      const data =
        response.data;


      setCartItems(
        Array.isArray(data.items)
          ? data.items
          : []
      );


      setSubtotal(
        Number(data.subtotal || 0)
      );


      setTotalItems(
        Number(data.total_items || 0)
      );


    } catch (err) {

      console.error(
        "Cart loading error:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        setError(
          "Your login session has expired. Please login again."
        );

      } else if (
        err.response?.data?.detail
      ) {

        setError(
          err.response.data.detail
        );

      } else {

        setError(
          "Unable to load your cart."
        );
      }


    } finally {

      setLoading(false);

    }
  };


  /* =========================================================
     AUTHORIZATION
     ========================================================= */

  useEffect(() => {

    if (!isLoggedIn) {

      navigate(
        "/login",
        { replace: true }
      );

      return;
    }


    if (user?.role !== "customer") {

      setError(
        "Only customer accounts can use the shopping cart."
      );

      setLoading(false);

      return;
    }


    loadCart();

  }, [
    isLoggedIn,
    user,
    navigate,
  ]);


  /* =========================================================
     PRODUCT HELPERS
     ========================================================= */

  const getProduct = (item) => {

    return (
      item.product ||
      item
    );
  };


  const getProductId = (item) => {

    const product =
      getProduct(item);


    return (
      product.id ||
      item.product_id
    );
  };


  const getProductName = (item) => {

    const product =
      getProduct(item);


    return (
      product.name ||
      item.product_name ||
      "Agricultural Product"
    );
  };


  const getProductPrice = (item) => {

    const product =
      getProduct(item);


    return Number(
      product.price ||
      item.price ||
      0
    );
  };


  const getProductUnit = (item) => {

    const product =
      getProduct(item);


    return (
      product.unit ||
      item.unit ||
      "unit"
    );
  };


  const getProductLocation = (item) => {

    const product =
      getProduct(item);


    return (
      product.location ||
      item.location ||
      "Nepal"
    );
  };


  const getProductImageUrl = (item) => {

    const product =
      getProduct(item);


    const imageUrl =
      product.image_url ||
      item.image_url;


    if (!imageUrl) {
      return null;
    }


    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {

      return imageUrl;
    }


    return `${BACKEND_URL}${imageUrl}`;
  };


  const getAvailableQuantity = (item) => {

    const product =
      getProduct(item);


    const available =
      product.quantity ??
      item.available_quantity;


    if (
      available === undefined ||
      available === null
    ) {

      return null;
    }


    return Number(available);
  };


  /* =========================================================
     UPDATE QUANTITY
     ========================================================= */

  const updateQuantity = async (
    item,
    newQuantity
  ) => {

    if (newQuantity < 1) {
      return;
    }


    const availableQuantity =
      getAvailableQuantity(item);


    if (
      availableQuantity !== null &&
      newQuantity > availableQuantity
    ) {

      setError(
        `Only ${availableQuantity} units are available.`
      );

      return;
    }


    const cartItemId =
      item.id ||
      item.cart_item_id;


    if (!cartItemId) {

      setError(
        "Cart item ID not found."
      );

      return;
    }


    try {

      setUpdatingId(cartItemId);
      setError("");


      await api.put(
        `/cart/${cartItemId}`,
        {
          quantity:
            Number(newQuantity),
        }
      );


      await loadCart();


    } catch (err) {

      console.error(
        "Cart quantity update error:",
        err
      );


      if (
        err.response?.data?.detail
      ) {

        setError(
          err.response.data.detail
        );

      } else {

        setError(
          "Unable to update quantity."
        );
      }


    } finally {

      setUpdatingId(null);

    }
  };


  /* =========================================================
     REMOVE ITEM
     ========================================================= */

  const removeItem = async (item) => {

    const cartItemId =
      item.id ||
      item.cart_item_id;


    if (!cartItemId) {

      setError(
        "Cart item ID not found."
      );

      return;
    }


    try {

      setUpdatingId(cartItemId);
      setError("");


      await api.delete(
        `/cart/${cartItemId}`
      );


      await loadCart();


    } catch (err) {

      console.error(
        "Remove cart item error:",
        err
      );


      if (
        err.response?.data?.detail
      ) {

        setError(
          err.response.data.detail
        );

      } else {

        setError(
          "Unable to remove this item."
        );
      }


    } finally {

      setUpdatingId(null);

    }
  };


  /* =========================================================
     CHECKOUT
     ========================================================= */

  const handleCheckout = () => {

    if (cartItems.length === 0) {

      setError(
        "Your cart is empty."
      );

      return;
    }


    navigate("/checkout");
  };


  /* =========================================================
     LOADING PAGE
     ========================================================= */

  if (loading) {

    return (

      <div className="marketplace-page">

        <nav className="navbar">

          <div className="navbar-container">

            <Link
              to="/"
              className="logo"
            >
              🌱 GreenChain
            </Link>

          </div>

        </nav>


        <section className="marketplace-header">

          <div className="container">

            <h1>
              🛒 My Shopping Cart
            </h1>

            <p>
              Loading your cart...
            </p>

          </div>

        </section>

      </div>
    );
  }


  /* =========================================================
     MAIN PAGE
     ========================================================= */

  return (

    <div className="marketplace-page">


      {/* NAVBAR */}

      <nav className="navbar">

        <div className="navbar-container">

          <Link
            to="/"
            className="logo"
          >
            🌱 GreenChain
          </Link>


          <div className="nav-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/marketplace">
              Marketplace
            </Link>

            <Link to="/wishlist">
              ❤️ Wishlist
            </Link>

            <Link to="/cart">
              🛒 Cart
            </Link>

            <Link to="/orders">
              📦 Orders
            </Link>

            <Link to="/dashboard">
              Dashboard
            </Link>

          </div>

        </div>

      </nav>


      {/* HEADER */}

      <section className="marketplace-header">

        <div className="container">

          <h1>
            🛒 My Shopping Cart
          </h1>

          <p>
            Review your selected agricultural
            products before checkout.
          </p>

        </div>

      </section>


      {/* CART */}

      <section className="marketplace-products">

        <div className="container">


          {/* ERROR */}

          {error && (

            <div className="error-message">

              {error}

            </div>
          )}


          {/* EMPTY CART */}

          {cartItems.length === 0 &&
            !error && (

              <div className="empty-cart">

                <h2>
                  Your cart is empty 🛒
                </h2>

                <p>
                  Browse the marketplace and
                  add agricultural products.
                </p>

                <Link
                  to="/marketplace"
                  className="primary-button"
                >
                  Browse Marketplace
                </Link>

              </div>
            )}


          {/* CART ITEMS */}

          {cartItems.length > 0 && (

            <div className="cart-container">


              {/* ITEMS */}

              <div className="cart-items">

                {cartItems.map((item) => {

                  const product =
                    getProduct(item);


                  const productName =
                    getProductName(item);


                  const price =
                    getProductPrice(item);


                  const unit =
                    getProductUnit(item);


                  const location =
                    getProductLocation(item);


                  const imageUrl =
                    getProductImageUrl(item);


                  const quantity =
                    Number(
                      item.quantity || 1
                    );


                  const availableQuantity =
                    getAvailableQuantity(item);


                  const itemTotal =
                    price * quantity;


                  const cartItemId =
                    item.id ||
                    item.cart_item_id;


                  const productId =
                    getProductId(item);


                  return (

                    <div
                      className="cart-item"
                      key={
                        cartItemId ||
                        productId
                      }
                    >


                      {/* IMAGE */}

                      <div className="cart-item-image">

                        {imageUrl ? (

                          <img
                            src={imageUrl}
                            alt={productName}
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />

                        ) : (

                          <div
                            style={{
                              fontSize:
                                "48px",
                            }}
                          >
                            🌱
                          </div>
                        )}

                      </div>


                      {/* DETAILS */}

                      <div className="cart-item-details">

                        <h3>
                          {productName}
                        </h3>


                        <p>
                          📍 {location}
                        </p>


                        <p>
                          Rs. {price} / {unit}
                        </p>


                        <div className="cart-quantity">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item,
                                quantity - 1
                              )
                            }
                            disabled={
                              updatingId ===
                                cartItemId ||
                              quantity <= 1
                            }
                          >
                            −
                          </button>


                          <span>
                            {quantity}
                          </span>


                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item,
                                quantity + 1
                              )
                            }
                            disabled={
                              updatingId ===
                                cartItemId ||
                              (
                                availableQuantity !==
                                  null &&
                                quantity >=
                                  availableQuantity
                              )
                            }
                          >
                            +
                          </button>

                        </div>


                        {availableQuantity !==
                          null && (

                          <small>

                            Available:
                            {" "}
                            {availableQuantity}
                            {" "}
                            {unit}

                          </small>
                        )}

                      </div>


                      {/* TOTAL */}

                      <div className="cart-item-total">

                        <strong>
                          Rs. {itemTotal}
                        </strong>


                        <button
                          type="button"
                          className="remove-button"
                          onClick={() =>
                            removeItem(item)
                          }
                          disabled={
                            updatingId ===
                            cartItemId
                          }
                        >
                          🗑️ Remove
                        </button>

                      </div>


                    </div>
                  );
                })}

              </div>


              {/* SUMMARY */}

              <div className="cart-summary">

                <h2>
                  Cart Summary
                </h2>


                <p>
                  Total Items:
                  {" "}
                  <strong>
                    {totalItems}
                  </strong>
                </p>


                <p>
                  Subtotal:
                  {" "}
                  <strong>
                    Rs. {subtotal}
                  </strong>
                </p>


                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    handleCheckout
                  }
                >
                  Proceed to Checkout
                </button>


                <p>

                  <Link
                    to="/marketplace"
                  >
                    ← Continue Shopping
                  </Link>

                </p>

              </div>


            </div>
          )}

        </div>

      </section>


      {/* FOOTER */}

      <footer className="footer">

        <div className="container">

          <h3>
            🌱 GreenChain
          </h3>

          <p>
            Smart Agricultural Marketplace
            for Nepal
          </p>

          <p>
            © 2026 GreenChain.
            All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}


export default Cart;