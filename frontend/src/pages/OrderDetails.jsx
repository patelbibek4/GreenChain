import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function OrderDetails() {

  const { orderId } = useParams();

  const navigate = useNavigate();

  const {
    user,
    isLoggedIn,
  } = useAuth();


  const [order, setOrder] =
    useState(null);

  const [payment, setPayment] =
    useState(null);


  const [loading, setLoading] =
    useState(true);

  const [paymentLoading, setPaymentLoading] =
    useState(true);


  const [cancelling, setCancelling] =
    useState(false);


  const [error, setError] =
    useState("");

  const [paymentError, setPaymentError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* =========================================================
     LOAD ORDER + PAYMENT
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
        "Only customer accounts can view order details."
      );

      setLoading(false);
      setPaymentLoading(false);

      return;
    }


    const fetchOrder = async () => {

      try {

        setLoading(true);
        setError("");


        const response =
          await api.get(
            `/orders/my-orders/${orderId}`
          );


        console.log(
          "Order details response:",
          response.data
        );


        setOrder(
          response.data
        );

      } catch (err) {

        console.error(
          "Order details error:",
          err
        );


        if (
          err.response?.status === 401
        ) {

          setError(
            "Your login session has expired. Please login again."
          );

        } else if (
          err.response?.status === 404
        ) {

          setError(
            "Order not found."
          );

        } else if (
          err.response?.data?.detail
        ) {

          setError(
            typeof err.response.data.detail ===
              "string"
              ? err.response.data.detail
              : "Unable to load order details."
          );

        } else {

          setError(
            "Unable to load order details."
          );
        }

      } finally {

        setLoading(false);

      }
    };


    const fetchPayment = async () => {

      try {

        setPaymentLoading(true);
        setPaymentError("");


        const response =
          await api.get(
            `/payments/order/${orderId}`
          );


        console.log(
          "Payment details response:",
          response.data
        );


        setPayment(
          response.data
        );

      } catch (err) {

        console.error(
          "Payment details error:",
          err
        );


        if (
          err.response?.status === 401
        ) {

          setPaymentError(
            "Your login session has expired. Please login again."
          );

        } else if (
          err.response?.status === 404
        ) {

          /*
           * No payment record is not
           * necessarily a page error.
           */

          setPayment(null);

        } else if (
          err.response?.data?.detail
        ) {

          setPaymentError(
            typeof err.response.data.detail ===
              "string"
              ? err.response.data.detail
              : "Unable to load payment information."
          );

        } else {

          setPaymentError(
            "Unable to load payment information."
          );
        }

      } finally {

        setPaymentLoading(false);

      }
    };


    fetchOrder();

    fetchPayment();

  }, [
    orderId,
    isLoggedIn,
    user,
    navigate,
  ]);


  /* =========================================================
     CANCEL ORDER
     ========================================================= */

  const handleCancelOrder = async () => {

    if (
      cancelling ||
      !order
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to cancel Order #${order.id}?`
      );


    if (!confirmed) {

      return;

    }


    try {

      setCancelling(true);

      setError("");
      setSuccess("");


      const response =
        await api.put(
          `/orders/my-orders/${orderId}/cancel`
        );


      console.log(
        "Cancel order response:",
        response.data
      );


      /*
       * Prefer backend response if it
       * contains the updated order.
       */

      if (
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {

        setOrder(
          (previousOrder) => ({
            ...previousOrder,
            ...response.data,
            status:
              response.data.status ||
              "cancelled",
          })
        );

      } else {

        setOrder(
          (previousOrder) => ({
            ...previousOrder,
            status: "cancelled",
          })
        );

      }


      setSuccess(
        "Order cancelled successfully."
      );

    } catch (err) {

      console.error(
        "Cancel order error:",
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
          typeof err.response.data.detail ===
            "string"
            ? err.response.data.detail
            : "Unable to cancel this order."
        );

      } else {

        setError(
          "Unable to cancel this order."
        );
      }

    } finally {

      setCancelling(false);

    }
  };


  /* =========================================================
     STATUS
     ========================================================= */

  const getStatusClass = (
    status
  ) => {

    switch (status) {

      case "pending":
        return "order-status pending";

      case "confirmed":
        return "order-status confirmed";

      case "shipped":
        return "order-status shipped";

      case "delivered":
        return "order-status delivered";

      case "cancelled":
        return "order-status cancelled";

      default:
        return "order-status";
    }
  };


  const formatStatus = (
    status
  ) => {

    if (!status) {

      return "Unknown";

    }


    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };


  /* =========================================================
     PAYMENT METHOD
     ========================================================= */

  const formatPaymentMethod = (
    method
  ) => {

    if (!method) {

      return "Not available";

    }


    return method
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };


  const formatPaymentStatus = (
    status
  ) => {

    if (!status) {

      return "Unknown";

    }


    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };


  /* =========================================================
     LOADING
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
              📦 Order Details
            </h1>

            <p>
              Loading order information...
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
            📦 Order Details
          </h1>

          <p>
            View complete information about
            your GreenChain order.
          </p>

        </div>

      </section>


      {/* CONTENT */}

      <section className="marketplace-products">

        <div className="container">


          {/* ERROR */}

          {error && (

            <div>

              <p className="error-message">
                {error}
              </p>

              <Link
                to="/orders"
                className="secondary-button"
              >
                ← Back to My Orders
              </Link>

            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <p className="success-message">

              ✅ {success}

            </p>

          )}


          {/* ORDER */}

          {!error &&
            order && (

            <div className="order-details-page">


              {/* =================================================
                  ORDER INFORMATION
                  ================================================= */}

              <div className="order-card">

                <div className="order-header">

                  <h2>
                    Order #{order.id}
                  </h2>


                  <span
                    className={
                      getStatusClass(
                        order.status
                      )
                    }
                  >
                    {formatStatus(
                      order.status
                    )}
                  </span>

                </div>


                <div className="order-details">

                  <p>
                    <strong>
                      Customer ID:
                    </strong>{" "}
                    {order.customer_id ??
                      "N/A"}
                  </p>


                  <p>
                    <strong>
                      Product ID:
                    </strong>{" "}
                    {order.product_id ??
                      "N/A"}
                  </p>


                  <p>
                    <strong>
                      Farmer ID:
                    </strong>{" "}
                    {order.farmer_id ??
                      "N/A"}
                  </p>


                  <p>
                    <strong>
                      Quantity:
                    </strong>{" "}
                    {order.quantity ??
                      "N/A"}
                  </p>


                  <p>
                    <strong>
                      Total Price:
                    </strong>{" "}
                    Rs.{" "}
                    {order.total_price ??
                      order.amount ??
                      0}
                  </p>


                  <p>
                    <strong>
                      Delivery Address:
                    </strong>{" "}
                    {order.delivery_address ||
                      "N/A"}
                  </p>


                  <p>
                    <strong>
                      Order Status:
                    </strong>{" "}
                    {formatStatus(
                      order.status
                    )}
                  </p>

                </div>

              </div>


              {/* =================================================
                  PAYMENT
                  ================================================= */}

              <div className="order-card">

                <div className="order-header">

                  <h2>
                    💳 Payment Information
                  </h2>


                  {payment && (

                    <span
                      className={
                        payment.payment_status ===
                        "paid"
                          ? "order-status delivered"
                          : "order-status pending"
                      }
                    >
                      {formatPaymentStatus(
                        payment.payment_status
                      )}
                    </span>

                  )}

                </div>


                {paymentLoading && (

                  <p>
                    Loading payment information...
                  </p>

                )}


                {!paymentLoading &&
                  paymentError && (

                  <p className="error-message">
                    {paymentError}
                  </p>

                )}


                {!paymentLoading &&
                  !paymentError &&
                  !payment && (

                  <p>
                    No payment record found
                    for this order.
                  </p>

                )}


                {!paymentLoading &&
                  payment && (

                  <div className="order-details">

                    <p>
                      <strong>
                        Payment ID:
                      </strong>{" "}
                      {payment.payment_id ??
                        payment.id ??
                        "N/A"}
                    </p>


                    <p>
                      <strong>
                        Payment Amount:
                      </strong>{" "}
                      Rs.{" "}
                      {payment.amount ??
                        payment.payment_amount ??
                        0}
                    </p>


                    <p>
                      <strong>
                        Payment Method:
                      </strong>{" "}
                      {formatPaymentMethod(
                        payment.payment_method ||
                        payment.method
                      )}
                    </p>


                    <p>
                      <strong>
                        Payment Status:
                      </strong>{" "}
                      {formatPaymentStatus(
                        payment.payment_status ||
                        payment.status
                      )}
                    </p>


                    <p>
                      <strong>
                        Transaction ID:
                      </strong>{" "}
                      {payment.transaction_id ||
                        "Not available"}
                    </p>

                  </div>

                )}

              </div>


              {/* =================================================
                  ORDER PROGRESS
                  ================================================= */}

              <div className="order-card">

                <h2>
                  🚚 Order Progress
                </h2>


                {order.status ===
                  "cancelled" ? (

                  <div>

                    <p className="error-message">
                      ❌ This order has been cancelled.
                    </p>

                  </div>

                ) : (

                  <div className="order-progress">


                    {/* PLACED */}

                    <div
                      className={
                        order.status ===
                          "pending" ||
                        order.status ===
                          "confirmed" ||
                        order.status ===
                          "shipped" ||
                        order.status ===
                          "delivered"
                          ? "progress-step active"
                          : "progress-step"
                      }
                    >

                      <span>
                        1
                      </span>

                      <p>
                        Order Placed
                      </p>

                    </div>


                    {/* CONFIRMED */}

                    <div
                      className={
                        order.status ===
                          "confirmed" ||
                        order.status ===
                          "shipped" ||
                        order.status ===
                          "delivered"
                          ? "progress-step active"
                          : "progress-step"
                      }
                    >

                      <span>
                        2
                      </span>

                      <p>
                        Confirmed
                      </p>

                    </div>


                    {/* SHIPPED */}

                    <div
                      className={
                        order.status ===
                          "shipped" ||
                        order.status ===
                          "delivered"
                          ? "progress-step active"
                          : "progress-step"
                      }
                    >

                      <span>
                        3
                      </span>

                      <p>
                        Shipped
                      </p>

                    </div>


                    {/* DELIVERED */}

                    <div
                      className={
                        order.status ===
                          "delivered"
                          ? "progress-step active"
                          : "progress-step"
                      }
                    >

                      <span>
                        4
                      </span>

                      <p>
                        Delivered
                      </p>

                    </div>

                  </div>

                )}

              </div>


              {/* =================================================
                  ACTIONS
                  ================================================= */}

              <div className="order-actions">


                <Link
                  to="/orders"
                  className="primary-button"
                >
                  ← Back to My Orders
                </Link>


                <Link
                  to={`/orders/${order.id}/tracking`}
                  className="secondary-button"
                >
                  🚚 Track Order
                </Link>


                <Link
                  to="/marketplace"
                  className="secondary-button"
                >
                  Continue Shopping
                </Link>


                {order.status ===
                  "pending" && (

                  <button
                    type="button"
                    className="remove-button"
                    onClick={
                      handleCancelOrder
                    }
                    disabled={
                      cancelling
                    }
                  >
                    {cancelling
                      ? "Cancelling..."
                      : "❌ Cancel Order"}
                  </button>

                )}

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


export default OrderDetails;