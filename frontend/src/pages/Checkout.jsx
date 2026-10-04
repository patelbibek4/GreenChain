import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Checkout() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("cash_on_delivery");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // SAFE ERROR MESSAGE
  // ==========================================

  const getErrorMessage = (detail) => {
    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.msg) {
            return item.msg;
          }

          return "Validation error";
        })
        .join(", ");
    }

    if (detail && typeof detail === "object") {
      if (detail.msg) {
        return detail.msg;
      }

      return "Request validation failed.";
    }

    return "An unexpected error occurred.";
  };

  // ==========================================
  // LOAD CART
  // ==========================================

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (user?.role !== "customer") {
      setError(
        "Only customer accounts can place orders."
      );

      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/cart/");

        console.log(
          "Checkout cart response:",
          response.data
        );

        const data = response.data;

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
          "Checkout cart error:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your login session has expired. Please login again."
          );
        } else if (err.response?.data?.detail) {
          setError(
            getErrorMessage(
              err.response.data.detail
            )
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

    fetchCart();
  }, [isLoggedIn, user, navigate]);

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const handlePlaceOrder = async () => {
    // Prevent double-click
    if (placingOrder) {
      return;
    }

    setError("");
    setSuccess("");

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (cartItems.length === 0) {
      setError(
        "Your cart is empty."
      );
      return;
    }

    if (!address.trim()) {
      setError(
        "Please enter your delivery address."
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        "Please enter your contact phone number."
      );
      return;
    }

    if (!paymentMethod) {
      setError(
        "Please select a payment method."
      );
      return;
    }

    setPlacingOrder(true);

    try {
      // ========================================
      // STEP 1
      // CREATE ORDERS
      // ========================================

      const createdOrders = [];

      for (const item of cartItems) {
        const product =
          item.product || item;

        const productId =
          product.id ||
          item.product_id;

        const quantity = Number(
          item.quantity || 0
        );

        if (!productId || quantity <= 0) {
          throw new Error(
            "Invalid product or quantity in cart."
          );
        }

        console.log(
          "Creating order:",
          {
            product_id:
              Number(productId),

            quantity:
              quantity,

            delivery_address:
              address.trim(),
          }
        );

        const orderResponse =
          await api.post(
            "/orders/",
            {
              product_id:
                Number(productId),

              quantity:
                quantity,

              delivery_address:
                address.trim(),
            }
          );

        createdOrders.push(
          {
            order: orderResponse.data,
            cartItem: item,
          }
        );
      }

      console.log(
        "Orders created:",
        createdOrders
      );

      // ========================================
      // STEP 2
      // CREATE PAYMENTS
      // ========================================

      const createdPayments = [];

      for (const created of createdOrders) {
        const order =
          created.order;

        const orderId =
          order.id ||
          order.order_id;

        let paymentAmount =
          Number(
            order.total_price ||
            order.amount ||
            0
          );

        // --------------------------------------
        // FALLBACK PAYMENT AMOUNT
        // --------------------------------------

        if (paymentAmount <= 0) {
          const item =
            created.cartItem;

          const product =
            item.product || item;

          const price =
            Number(
              product.price ||
              item.price ||
              0
            );

          const quantity =
            Number(
              item.quantity || 0
            );

          paymentAmount =
            price * quantity;
        }

        if (
          !orderId ||
          paymentAmount <= 0
        ) {
          throw new Error(
            "Unable to determine payment information for an order."
          );
        }

        console.log(
          "Creating payment:",
          {
            order_id:
              Number(orderId),

            payment_method:
              paymentMethod,

            amount:
              Number(paymentAmount),
          }
        );

        const paymentResponse =
          await api.post(
            "/payments/",
            {
              order_id:
                Number(orderId),

              payment_method:
                paymentMethod,

              amount:
                Number(paymentAmount),
            }
          );

        createdPayments.push(
          paymentResponse.data
        );
      }

      console.log(
        "Payments created:",
        createdPayments
      );

      // ========================================
      // STEP 3
      // CLEAR CART
      // ========================================

      console.log(
        "Clearing purchased cart items..."
      );

      for (const item of cartItems) {
        const cartItemId =
          item.id ||
          item.cart_item_id;

        if (!cartItemId) {
          console.warn(
            "Cart item ID not found:",
            item
          );

          continue;
        }

        await api.delete(
          `/cart/${cartItemId}`
        );

        console.log(
          `Cart item ${cartItemId} removed.`
        );
      }

      // ========================================
      // STEP 4
      // SUCCESS
      // ========================================

      const paymentText =
        paymentMethod ===
        "cash_on_delivery"
          ? "Cash on Delivery selected."
          : paymentMethod ===
            "esewa"
          ? "eSewa payment record created."
          : paymentMethod ===
            "khalti"
          ? "Khalti payment record created."
          : "Payment record created.";

      setSuccess(
        `Order placed successfully! 🌱 ${createdOrders.length} order(s) created. ${paymentText}`
      );

      // Empty local cart immediately
      setCartItems([]);
      setSubtotal(0);
      setTotalItems(0);

      // Redirect after showing success
      setTimeout(() => {
        navigate("/orders");
      }, 2000);

    } catch (err) {
      console.error(
        "Checkout error:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (detail) {
        setError(
          getErrorMessage(detail)
        );
      } else if (err.message) {
        setError(
          err.message
        );
      } else {
        setError(
          "Unable to complete checkout. Please try again."
        );
      }
    } finally {
      setPlacingOrder(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

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
              💳 Checkout
            </h1>

            <p>
              Loading your order...
            </p>

          </div>

        </section>

      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

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
              📦 My Orders
            </Link>

            <Link to="/dashboard">
              📊 Dashboard
            </Link>

          </div>

        </div>

      </nav>

      {/* HEADER */}

      <section className="marketplace-header">

        <div className="container">

          <h1>
            💳 Checkout
          </h1>

          <p>
            Complete your order,
            delivery and payment information.
          </p>

        </div>

      </section>

      {/* CONTENT */}

      <section className="marketplace-products">

        <div className="container">

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {/* EMPTY CART */}

          {cartItems.length === 0 &&
            !success &&
            !error && (

              <div className="empty-cart">

                <h2>
                  Your cart is empty 🛒
                </h2>

                <p>
                  Please add products before
                  checking out.
                </p>

                <Link
                  to="/marketplace"
                  className="primary-button"
                >
                  Browse Marketplace
                </Link>

              </div>
            )}

          {/* CHECKOUT */}

          {cartItems.length > 0 && (

            <div className="checkout-container">

              {/* DELIVERY */}

              <div className="checkout-card">

                <h2>
                  📦 Delivery Information
                </h2>

                <label
                  htmlFor="address"
                >
                  Delivery Address
                </label>

                <textarea
                  id="address"
                  rows="5"
                  placeholder="Enter your complete delivery address"
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  disabled={placingOrder}
                />

                <label
                  htmlFor="phone"
                >
                  Contact Phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  disabled={placingOrder}
                />

              </div>

              {/* PAYMENT */}

              <div className="checkout-card">

                <h2>
                  💰 Payment Method
                </h2>

                {/* CASH */}

                <label>

                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_delivery"
                    checked={
                      paymentMethod ===
                      "cash_on_delivery"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    disabled={placingOrder}
                  />

                  {" "}
                  Cash on Delivery

                </label>

                <p>
                  Pay the farmer when your
                  order is delivered.
                </p>

                <br />

                {/* ESEWA */}

                <label>

                  <input
                    type="radio"
                    name="payment"
                    value="esewa"
                    checked={
                      paymentMethod ===
                      "esewa"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    disabled={placingOrder}
                  />

                  {" "}
                  eSewa

                </label>

                <p>
                  eSewa gateway integration
                  will be connected in the
                  next payment phase.
                </p>

                <br />

                {/* KHALTI */}

                <label>

                  <input
                    type="radio"
                    name="payment"
                    value="khalti"
                    checked={
                      paymentMethod ===
                      "khalti"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                    disabled={placingOrder}
                  />

                  {" "}
                  Khalti

                </label>

                <p>
                  Khalti gateway integration
                  will be connected in the
                  next payment phase.
                </p>

              </div>

              {/* ORDER SUMMARY */}

              <div className="checkout-card">

                <h2>
                  🧾 Order Summary
                </h2>

                {cartItems.map(
                  (item) => {

                    const product =
                      item.product ||
                      item;

                    const productName =
                      product.name ||
                      item.product_name ||
                      "Agricultural Product";

                    const price =
                      Number(
                        product.price ||
                        item.price ||
                        0
                      );

                    const quantity =
                      Number(
                        item.quantity ||
                        0
                      );

                    const itemTotal =
                      price *
                      quantity;

                    return (

                      <div
                        key={
                          item.id ||
                          item.cart_item_id ||
                          `${productName}-${quantity}`
                        }
                        style={{
                          borderBottom:
                            "1px solid #ddd",

                          padding:
                            "10px 0",
                        }}
                      >

                        <p>
                          <strong>
                            {productName}
                          </strong>
                        </p>

                        <p>
                          {quantity} × Rs.{" "}
                          {price}
                        </p>

                        <p>
                          Rs.{" "}
                          {itemTotal}
                        </p>

                      </div>
                    );
                  }
                )}

                <p>
                  Total Items:{" "}
                  <strong>
                    {totalItems}
                  </strong>
                </p>

                <h3>
                  Total: Rs.{" "}
                  {subtotal}
                </h3>

                <p>
                  Payment Method:{" "}
                  <strong>
                    {paymentMethod ===
                    "cash_on_delivery"
                      ? "Cash on Delivery"
                      : paymentMethod ===
                        "esewa"
                      ? "eSewa"
                      : "Khalti"}
                  </strong>
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    handlePlaceOrder
                  }
                  disabled={
                    placingOrder
                  }
                >
                  {placingOrder
                    ? "Processing..."
                    : "🛒 Place Order & Pay"}
                </button>

                <p>

                  <Link to="/cart">
                    ← Back to Cart
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

export default Checkout;