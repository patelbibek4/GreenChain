import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";


function OrderTracking() {

  const { orderId } = useParams();

  const navigate = useNavigate();

  const {
    user,
    isLoggedIn,
  } = useAuth();


  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     LOAD TRACKING
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
        "Only customer accounts can track orders."
      );

      setLoading(false);

      return;
    }


    const fetchOrderTracking =
      async () => {

        try {

          setLoading(true);
          setError("");


          const response =
            await api.get(
              `/orders/my-orders/${orderId}/tracking`
            );


          console.log(
            "Order tracking response:",
            response.data
          );


          setOrder(
            response.data
          );

        } catch (err) {

          console.error(
            "Error loading order tracking:",
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
              "Order tracking information not found."
            );

          } else if (
            err.response?.data?.detail
          ) {

            const detail =
              err.response.data.detail;


            setError(
              typeof detail === "string"
                ? detail
                : "Unable to load order tracking."
            );

          } else {

            setError(
              "Unable to load order tracking."
            );
          }

        } finally {

          setLoading(false);

        }
      };


    fetchOrderTracking();

  }, [
    orderId,
    isLoggedIn,
    user,
    navigate,
  ]);


  /* =========================================================
     STATUS
     ========================================================= */

  const getStatus = () => {

    if (!order) {

      return "pending";

    }


    return String(
      order.status ||
      order.order_status ||
      order.current_status ||
      "pending"
    ).toLowerCase();

  };


  const status =
    getStatus();


  /* =========================================================
     TRACKING STEPS
     ========================================================= */

  const steps = [

    {
      key: "pending",
      label: "Order Placed",
      icon: "📝",
    },

    {
      key: "confirmed",
      label: "Confirmed",
      icon: "✅",
    },

    {
      key: "shipped",
      label: "Shipped",
      icon: "🚚",
    },

    {
      key: "delivered",
      label: "Delivered",
      icon: "📦",
    },

  ];


  const statusOrder = {

    pending: 0,

    confirmed: 1,

    shipped: 2,

    delivered: 3,

  };


  const currentStep =
    statusOrder[status] !== undefined
      ? statusOrder[status]
      : 0;


  const isCancelled =
    status === "cancelled";


  /* =========================================================
     STEP STYLE
     ========================================================= */

  const getStepStyle = (
    index
  ) => {

    if (isCancelled) {

      return styles.trackingStep;

    }


    if (index < currentStep) {

      return {
        ...styles.trackingStep,
        ...styles.completed,
      };

    }


    if (index === currentStep) {

      return {
        ...styles.trackingStep,
        ...styles.active,
      };

    }


    return styles.trackingStep;

  };


  /* =========================================================
     LINE STYLE
     ========================================================= */

  const getLineStyle = (
    index
  ) => {

    if (
      !isCancelled &&
      index < currentStep
    ) {

      return {
        ...styles.line,
        ...styles.lineCompleted,
      };

    }


    return styles.line;

  };


  /* =========================================================
     STATUS DISPLAY
     ========================================================= */

  const formatStatus = (
    value
  ) => {

    if (!value) {

      return "Unknown";

    }


    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );

  };


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {

    return (

      <div style={styles.page}>

        <Navbar />

        <main style={styles.container}>

          <div style={styles.card}>

            <h1>
              🚚 Order Tracking
            </h1>

            <p>
              Loading tracking information...
            </p>

          </div>

        </main>

        <Footer />

      </div>

    );
  }


  /* =========================================================
     ERROR
     ========================================================= */

  if (error) {

    return (

      <div style={styles.page}>

        <Navbar />

        <main style={styles.container}>

          <div style={styles.card}>

            <h1>
              🚚 Order Tracking
            </h1>


            <p style={styles.error}>
              {error}
            </p>


            <Link
              to="/orders"
              style={styles.button}
            >
              ← Back to My Orders
            </Link>

          </div>

        </main>

        <Footer />

      </div>

    );
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (

    <div style={styles.page}>

      <Navbar />


      <main style={styles.container}>

        <div style={styles.card}>

          <h1>
            🚚 Order Tracking
          </h1>


          <p style={styles.subtitle}>
            Track the current status of your
            GreenChain order.
          </p>


          {order && (

            <>


              {/* =================================================
                  ORDER HEADER
                  ================================================= */}

              <div style={styles.orderHeader}>

                <h2>

                  Order #
                  {order.id ||
                    order.order_id ||
                    orderId}

                </h2>


                <span
                  style={{
                    ...styles.status,

                    ...(isCancelled
                      ? styles.cancelled
                      : styles.statusActive),
                  }}
                >

                  {formatStatus(
                    status
                  )}

                </span>

              </div>


              {/* =================================================
                  TRACKING
                  ================================================= */}

              {isCancelled ? (

                <div
                  style={
                    styles.cancelledBox
                  }
                >

                  <h3>
                    ❌ Order Cancelled
                  </h3>

                  <p>
                    This order has been
                    cancelled and will not
                    continue through the
                    delivery process.
                  </p>

                </div>

              ) : (

                <div
                  style={
                    styles.trackingContainer
                  }
                >

                  {steps.map(
                    (step, index) => (

                    <div
                      key={step.key}
                      style={
                        styles.stepWrapper
                      }
                    >


                      <div
                        style={
                          getStepStyle(
                            index
                          )
                        }
                      >

                        <div
                          style={
                            styles.icon
                          }
                        >
                          {step.icon}
                        </div>


                        <div
                          style={
                            styles.stepNumber
                          }
                        >
                          {index + 1}
                        </div>


                        <div
                          style={
                            styles.stepLabel
                          }
                        >
                          {step.label}
                        </div>

                      </div>


                      {index <
                        steps.length - 1 && (

                        <div
                          style={
                            getLineStyle(
                              index
                            )
                          }
                        />

                      )}

                    </div>

                  ))}

                </div>

              )}


              {/* =================================================
                  ORDER INFORMATION
                  ================================================= */}

              <div
                style={styles.infoBox}
              >

                <p>

                  <strong>
                    Current Status:
                  </strong>{" "}

                  {formatStatus(
                    status
                  )}

                </p>


                <p>

                  <strong>
                    Order ID:
                  </strong>{" "}

                  #
                  {order.id ||
                    order.order_id ||
                    orderId}

                </p>


                {order.customer_id !==
                  undefined && (

                  <p>

                    <strong>
                      Customer ID:
                    </strong>{" "}

                    {order.customer_id}

                  </p>

                )}


                {order.product_id !==
                  undefined && (

                  <p>

                    <strong>
                      Product ID:
                    </strong>{" "}

                    {order.product_id}

                  </p>

                )}


                {order.farmer_id !==
                  undefined && (

                  <p>

                    <strong>
                      Farmer ID:
                    </strong>{" "}

                    {order.farmer_id}

                  </p>

                )}


                {order.quantity !==
                  undefined && (

                  <p>

                    <strong>
                      Quantity:
                    </strong>{" "}

                    {order.quantity}

                  </p>

                )}


                {order.total_price !==
                  undefined && (

                  <p>

                    <strong>
                      Total Price:
                    </strong>{" "}

                    Rs.{" "}
                    {order.total_price}

                  </p>

                )}


                {order.delivery_address && (

                  <p>

                    <strong>
                      Delivery Address:
                    </strong>{" "}

                    {order.delivery_address}

                  </p>

                )}

              </div>

            </>

          )}


          {/* =================================================
              ACTIONS
              ================================================= */}

          <div style={styles.actions}>

            <Link
              to="/orders"
              style={styles.secondaryButton}
            >
              ← Back to My Orders
            </Link>


            <Link
              to={`/orders/${orderId}`}
              style={styles.button}
            >
              📦 View Order Details
            </Link>


            <Link
              to="/marketplace"
              style={styles.button}
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </main>


      <Footer />

    </div>

  );
}


/* ===========================================================
   NAVBAR
   =========================================================== */

function Navbar() {

  return (

    <nav style={styles.navbar}>

      <div style={styles.navContainer}>

        <Link
          to="/"
          style={styles.logo}
        >
          🌱 GreenChain
        </Link>


        <div style={styles.navLinks}>

          <Link
            to="/"
            style={styles.navLink}
          >
            Home
          </Link>


          <Link
            to="/marketplace"
            style={styles.navLink}
          >
            Marketplace
          </Link>


          <Link
            to="/cart"
            style={styles.navLink}
          >
            🛒 Cart
          </Link>


          <Link
            to="/orders"
            style={styles.navLink}
          >
            📦 My Orders
          </Link>


          <Link
            to="/dashboard"
            style={styles.navLink}
          >
            📊 Dashboard
          </Link>

        </div>

      </div>

    </nav>

  );
}


/* ===========================================================
   FOOTER
   =========================================================== */

function Footer() {

  return (

    <footer style={styles.footer}>

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

    </footer>

  );

}


/* ===========================================================
   STYLES
   =========================================================== */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f7f6",
    display: "flex",
    flexDirection: "column",
  },


  navbar: {
    background: "#ffffff",
    borderBottom: "1px solid #ddd",
    padding: "15px 0",
  },


  navContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },


  logo: {
    textDecoration: "none",
    color: "#198754",
    fontSize: "24px",
    fontWeight: "bold",
  },


  navLinks: {
    display: "flex",
    gap: "18px",
    flexWrap: "wrap",
  },


  navLink: {
    textDecoration: "none",
    color: "#333",
    fontWeight: "500",
  },


  container: {
    width: "100%",
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "40px 20px",
    flex: 1,
    boxSizing: "border-box",
  },


  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.08)",
  },


  subtitle: {
    color: "#666",
    marginBottom: "30px",
  },


  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "35px",
  },


  status: {
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },


  statusActive: {
    background: "#fff3cd",
    color: "#856404",
  },


  cancelled: {
    background: "#f8d7da",
    color: "#842029",
  },


  trackingContainer: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    margin: "40px 0",
    overflowX: "auto",
    paddingBottom: "20px",
  },


  stepWrapper: {
    display: "flex",
    alignItems: "center",
    minWidth: "150px",
  },


  trackingStep: {
    minWidth: "120px",
    textAlign: "center",
    padding: "10px",
    borderRadius: "10px",
    opacity: 0.45,
  },


  completed: {
    opacity: 1,
    background: "#e8f5e9",
  },


  active: {
    opacity: 1,
    background: "#fff3cd",
    transform: "scale(1.03)",
  },


  icon: {
    fontSize: "30px",
    marginBottom: "5px",
  },


  stepNumber: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#777",
    marginBottom: "5px",
  },


  stepLabel: {
    fontWeight: "600",
    fontSize: "14px",
  },


  line: {
    width: "50px",
    height: "4px",
    background: "#ddd",
    margin: "0 5px",
  },


  lineCompleted: {
    background: "#198754",
  },


  infoBox: {
    background: "#f8f9fa",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "20px",
    lineHeight: "1.8",
  },


  cancelledBox: {
    background: "#f8d7da",
    color: "#842029",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "25px",
  },


  actions: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    marginTop: "30px",
  },


  button: {
    display: "inline-block",
    background: "#198754",
    color: "#ffffff",
    textDecoration: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    fontWeight: "600",
  },


  secondaryButton: {
    display: "inline-block",
    background: "#6c757d",
    color: "#ffffff",
    textDecoration: "none",
    padding: "10px 18px",
    borderRadius: "6px",
    fontWeight: "600",
  },


  error: {
    color: "#dc3545",
    background: "#f8d7da",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },


  footer: {
    background: "#212529",
    color: "#ffffff",
    textAlign: "center",
    padding: "25px 20px",
    marginTop: "auto",
  },

};


export default OrderTracking;