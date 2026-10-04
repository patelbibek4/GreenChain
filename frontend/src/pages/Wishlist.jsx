import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

import {
  useAuth,
} from "../context/AuthContext";


const BACKEND_URL =
   import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8001";


function Wishlist() {

  const navigate =
    useNavigate();

  const {
    user,
    isLoggedIn,
  } = useAuth();


  const [wishlist, setWishlist] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [removingId, setRemovingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");


  /* =========================================================
     LOAD WISHLIST
     ========================================================= */

  useEffect(() => {

    if (!isLoggedIn || !user) {

      navigate(
        "/login",
        { replace: true }
      );

      return;
    }


    if (user.role !== "customer") {

      navigate(
        "/",
        { replace: true }
      );

      return;
    }


    loadWishlist();

  }, [
    isLoggedIn,
    user,
    navigate,
  ]);


  const loadWishlist =
    async () => {

      try {

        setLoading(true);
        setError("");


        const response =
          await api.get(
            "/wishlist/"
          );


        console.log(
          "Wishlist data:",
          response.data
        );


        const data =
          response.data;


        if (Array.isArray(data)) {

          setWishlist(data);

        } else if (
          Array.isArray(
            data?.items
          )
        ) {

          setWishlist(
            data.items
          );

        } else if (
          Array.isArray(
            data?.wishlist
          )
        ) {

          setWishlist(
            data.wishlist
          );

        } else {

          setWishlist([]);

        }

      } catch (err) {

        console.error(
          "Error loading wishlist:",
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

          const detail =
            err.response.data.detail;


          setError(
            typeof detail === "string"
              ? detail
              : "Failed to load your wishlist."
          );

        } else {

          setError(
            "Failed to load your wishlist."
          );

        }

      } finally {

        setLoading(false);

      }

    };


  /* =========================================================
     PRODUCT HELPERS
     ========================================================= */

  const getProduct =
    (item) => {

      return (
        item?.product ||
        item
      );

    };


  const getProductId =
    (item) => {

      const product =
        getProduct(item);


      return (
        product?.id ??
        item?.product_id ??
        item?.id ??
        null
      );

    };


  const getProductName =
    (item) => {

      const product =
        getProduct(item);


      return (
        product?.name ||
        item?.name ||
        `Product #${getProductId(item)}`
      );

    };


  const getProductPrice =
    (item) => {

      const product =
        getProduct(item);


      const price =
        product?.price ??
        item?.price;


      if (
        price === undefined ||
        price === null
      ) {

        return null;

      }


      return Number(price);

    };


  const getProductDescription =
    (item) => {

      const product =
        getProduct(item);


      return (
        product?.description ||
        item?.description ||
        "Fresh agricultural product from a GreenChain farmer."
      );

    };


  const getProductLocation =
    (item) => {

      const product =
        getProduct(item);


      return (
        product?.location ||
        item?.location ||
        "Nepal"
      );

    };


  const getProductUnit =
    (item) => {

      const product =
        getProduct(item);


      return (
        product?.unit ||
        item?.unit ||
        "unit"
      );

    };


  const getProductImageUrl =
    (item) => {

      const product =
        getProduct(item);


      const imageUrl =
        product?.image_url ||
        item?.image_url;


      if (!imageUrl) {

        return null;

      }


      if (
        imageUrl.startsWith(
          "http://"
        ) ||
        imageUrl.startsWith(
          "https://"
        )
      ) {

        return imageUrl;

      }


      return (
        `${BACKEND_URL}${imageUrl}`
      );

    };


  /* =========================================================
     REMOVE FROM WISHLIST
     ========================================================= */

  const removeFromWishlist =
    async (productId) => {

      if (!productId) {

        setError(
          "Product ID not found."
        );

        return;

      }


      try {

        setRemovingId(
          productId
        );

        setError("");
        setMessage("");


        await api.delete(
          `/wishlist/${productId}`
        );


        setWishlist(
          (currentWishlist) =>
            currentWishlist.filter(
              (item) =>
                getProductId(item) !==
                productId
            )
        );


        setMessage(
          "Product removed from wishlist. ❤️"
        );


        setTimeout(() => {

          setMessage("");

        }, 3000);

      } catch (err) {

        console.error(
          "Error removing wishlist item:",
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

          const detail =
            err.response.data.detail;


          setError(
            typeof detail === "string"
              ? detail
              : "Failed to remove product from wishlist."
          );

        } else {

          setError(
            "Failed to remove product from wishlist."
          );

        }

      } finally {

        setRemovingId(null);

      }

    };


  /* =========================================================
     AUTH GUARD
     ========================================================= */

  if (
    !isLoggedIn ||
    !user ||
    user.role !== "customer"
  ) {

    return null;

  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (

    <div className="wishlist-page">


      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <header className="navbar">

        <div className="navbar-container">


          <Link
            to="/"
            className="logo"
          >
            🌱 GreenChain
          </Link>


          <nav className="nav-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/marketplace">
              Marketplace
            </Link>

            <Link to="/cart">
              🛒 Cart
            </Link>

            <Link to="/orders">
              📦 My Orders
            </Link>

            <Link to="/dashboard">
              📊 Dashboard
            </Link>

          </nav>


        </div>

      </header>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="wishlist-container">


        {/* ===================================================
            HEADER
            =================================================== */}

        <section className="wishlist-header">

          <div>

            <h1>
              ❤️ My Wishlist
            </h1>

            <p>
              Save your favorite agricultural
              products and find them easily later.
            </p>

          </div>


          <Link
            to="/marketplace"
            className="primary-button"
          >
            🛍️ Browse Marketplace
          </Link>

        </section>


        {/* ===================================================
            MESSAGES
            =================================================== */}

        {message && (

          <div className="success-message">

            {message}

          </div>

        )}


        {error && (

          <div className="error-message">

            {error}

          </div>

        )}


        {/* ===================================================
            LOADING
            =================================================== */}

        {loading ? (

          <div className="loading-state">

            <p>
              Loading your wishlist...
            </p>

          </div>


        ) : wishlist.length === 0 ? (


          /* =================================================
             EMPTY WISHLIST
             ================================================= */

          <section className="empty-state">

            <div className="empty-icon">
              ❤️
            </div>


            <h2>
              Your Wishlist Is Empty
            </h2>


            <p>
              You haven't saved any products yet.
              Explore the marketplace and add
              products you like to your wishlist.
            </p>


            <Link
              to="/marketplace"
              className="primary-button"
            >
              Explore Marketplace
            </Link>

          </section>


        ) : (


          /* =================================================
             WISHLIST PRODUCTS
             ================================================= */

          <section className="wishlist-section">


            <div className="wishlist-count">

              <h2>
                Saved Products
              </h2>


              <span>

                {wishlist.length}{" "}

                {wishlist.length === 1
                  ? "product"
                  : "products"}

              </span>

            </div>


            <div className="wishlist-grid">


              {wishlist.map(
                (item) => {

                  const productId =
                    getProductId(item);


                  const productName =
                    getProductName(item);


                  const productPrice =
                    getProductPrice(item);


                  const productDescription =
                    getProductDescription(item);


                  const productLocation =
                    getProductLocation(item);


                  const productUnit =
                    getProductUnit(item);


                  const imageUrl =
                    getProductImageUrl(item);


                  return (

                    <article
                      className="wishlist-card"
                      key={
                        productId ||
                        `wishlist-${Math.random()}`
                      }
                    >


                      {/* =================================
                          PRODUCT IMAGE
                          ================================= */}

                      <div className="wishlist-card-icon">

                        {imageUrl ? (

                          <img
                            src={imageUrl}
                            alt={productName}
                            style={{
                              width:
                                "100%",
                              height:
                                "180px",
                              objectFit:
                                "cover",
                              borderRadius:
                                "10px",
                            }}
                            onError={(
                              event
                            ) => {

                              event.currentTarget.style.display =
                                "none";

                            }}
                          />

                        ) : (

                          <div
                            style={{
                              fontSize:
                                "55px",
                              padding:
                                "35px 0",
                              textAlign:
                                "center",
                            }}
                          >
                            🌱
                          </div>

                        )}

                      </div>


                      {/* =================================
                          PRODUCT CONTENT
                          ================================= */}

                      <div className="wishlist-card-content">


                        <h3>
                          {productName}
                        </h3>


                        {productPrice !== null && (

                          <div className="wishlist-price">

                            Rs.{" "}
                            {productPrice}

                            {productUnit && (
                              <>
                                {" "}/{" "}
                                {productUnit}
                              </>
                            )}

                          </div>

                        )}


                        <p>
                          {productDescription}
                        </p>


                        <div className="wishlist-location">

                          📍{" "}
                          {productLocation}

                        </div>


                      </div>


                      {/* =================================
                          ACTIONS
                          ================================= */}

                      <div className="wishlist-card-actions">


                        {productId && (

                          <Link
                            to={`/marketplace/product/${productId}`}
                            className="primary-button"
                          >
                            View Product
                          </Link>

                        )}


                        {productId && (

                          <button
                            type="button"
                            className="remove-wishlist-button"
                            onClick={() =>
                              removeFromWishlist(
                                productId
                              )
                            }
                            disabled={
                              removingId ===
                              productId
                            }
                          >

                            {removingId ===
                            productId
                              ? "Removing..."
                              : "❤️ Remove"}

                          </button>

                        )}

                      </div>


                    </article>

                  );

                }
              )}

            </div>

          </section>

        )}


      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="footer">

        <p>
          🌱 GreenChain — Smart Agricultural
          Marketplace for Nepal
        </p>

        <p>
          © 2026 GreenChain.
          All rights reserved.
        </p>

      </footer>


    </div>

  );

}


export default Wishlist;