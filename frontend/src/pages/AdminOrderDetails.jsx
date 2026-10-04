import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminOrderDetails() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { logout } = useAuth();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const orderResponse = await api.get(
        `/admin/orders/${orderId}`
      );

      console.log(
        "Admin order response:",
        orderResponse.data
      );

      setOrder(orderResponse.data);

      // Payment information is loaded separately.
      // If no payment record exists, the order
      // information will still be displayed.
      try {
        const paymentResponse = await api.get(
          `/payments/order/${orderId}`
        );

        console.log(
          "Admin order payment response:",
          paymentResponse.data
        );

        setPayment(paymentResponse.data);
      } catch (paymentError) {
        console.log(
          "No payment information available:",
          paymentError
        );

        setPayment(null);
      }

    } catch (err) {
      console.error(
        "Admin order details error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your admin session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Access denied. Admin permission required."
        );
      } else if (err.response?.status === 404) {
        setError(
          "Order not found."
        );
      } else if (err.response?.data?.detail) {
        setError(
          err.response.data.detail
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusStyle = (status) => {
    if (status === "pending") {
      return {
        background: "#fff3cd",
        color: "#856404",
      };
    }

    if (status === "confirmed") {
      return {
        background: "#d1ecf1",
        color: "#0c5460",
      };
    }

    if (status === "shipped") {
      return {
        background: "#cce5ff",
        color: "#004085",
      };
    }

    if (status === "delivered") {
      return {
        background: "#d4edda",
        color: "#155724",
      };
    }

    if (status === "cancelled") {
      return {
        background: "#f8d7da",
        color: "#721c24",
      };
    }

    return {
      background: "#e2e3e5",
      color: "#383d41",
    };
  };

  const getStatusLabel = (status) => {
    if (!status) {
      return "Unknown";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const getPaymentValue = (
    fieldNames,
    fallback = "N/A"
  ) => {
    if (!payment) {
      return fallback;
    }

    for (const field of fieldNames) {
      if (
        payment[field] !== undefined &&
        payment[field] !== null &&
        payment[field] !== ""
      ) {
        return payment[field];
      }
    }

    return fallback;
  };

  if (loading) {
    return (
      <div className="dashboard-page">

        <nav className="dashboard-navbar">

          <div
            className="dashboard-logo"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
            style={{
              cursor: "pointer",
            }}
          >
            🌱 GreenChain Admin
          </div>

          <div className="dashboard-nav-links">

            <button
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
            >
              Orders
            </button>

            <button
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </nav>

        <main className="dashboard-container">

          <section className="dashboard-section">

            <div className="dashboard-card">

              <h2>
                Loading order...
              </h2>

              <p>
                Please wait while GreenChain
                loads the order details.
              </p>

            </div>

          </section>

        </main>

      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="dashboard-page">

        <nav className="dashboard-navbar">

          <div
            className="dashboard-logo"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
            style={{
              cursor: "pointer",
            }}
          >
            🌱 GreenChain Admin
          </div>

          <div className="dashboard-nav-links">

            <button
              onClick={() =>
                navigate(
                  "/admin/dashboard"
                )
              }
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
            >
              Orders
            </button>

            <button
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </nav>

        <main className="dashboard-container">

          <section className="dashboard-section">

            <div className="dashboard-card">

              <h2>
                Unable to Load Order
              </h2>

              <p className="error-message">
                {error ||
                  "Order not found."}
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/admin/orders"
                  )
                }
                className="auth-button"
              >
                ← Back to Orders
              </button>

            </div>

          </section>

        </main>

      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="dashboard-navbar">

        <div
          className="dashboard-logo"
          onClick={() =>
            navigate(
              "/admin/dashboard"
            )
          }
          style={{
            cursor: "pointer",
          }}
        >
          🌱 GreenChain Admin
        </div>

        <div className="dashboard-nav-links">

          <button
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate(
                "/admin/users"
              )
            }
          >
            Users
          </button>

          <button
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
          >
            Products
          </button>

          <button
            onClick={() =>
              navigate(
                "/admin/orders"
              )
            }
          >
            Orders
          </button>

          <button
            onClick={() =>
              navigate(
                "/marketplace"
              )
            }
          >
            Marketplace
          </button>

          <button
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="dashboard-container">

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <h1>
              Order #{order.id} 📦
            </h1>

            <p>
              Complete order information
              for GreenChain administration.
            </p>

          </div>

          <div>

            <button
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
              className="auth-button"
            >
              ← Back to Orders
            </button>

          </div>

        </div>


        {/* ===================================================
            STATUS
        =================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              Order Status
            </h2>

            <div
              style={{
                marginTop: "15px",
              }}
            >

              <span
                style={{
                  ...getStatusStyle(
                    order.status
                  ),
                  padding:
                    "10px 16px",
                  borderRadius:
                    "8px",
                  display:
                    "inline-block",
                  fontWeight:
                    "700",
                }}
              >
                {getStatusLabel(
                  order.status
                )}
              </span>

            </div>

          </div>

        </section>


        {/* ===================================================
            ORDER INFORMATION
        =================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h3>
                🆔 Order ID
              </h3>

              <p className="dashboard-number">
                #{order.id}
              </p>

            </div>


            <div className="dashboard-card">

              <h3>
                📦 Product
              </h3>

              <p>
                {
                  order.product?.name ||
                  "Unknown"
                }
              </p>

              <small>
                Product ID:{" "}
                {order.product_id}
              </small>

            </div>


            <div className="dashboard-card">

              <h3>
                🔢 Quantity
              </h3>

              <p className="dashboard-number">
                {order.quantity}
              </p>

            </div>


            <div className="dashboard-card">

              <h3>
                💰 Total Price
              </h3>

              <p className="dashboard-number">
                Rs.{" "}
                {Number(
                  order.total_price || 0
                ).toFixed(2)}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            CUSTOMER AND FARMER
        =================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h2>
                👤 Customer
              </h2>

              <p>
                <strong>
                  Name:
                </strong>{" "}
                {
                  order.customer?.name ||
                  "Unknown"
                }
              </p>

              <p>
                <strong>
                  Email:
                </strong>{" "}
                {
                  order.customer?.email ||
                  "N/A"
                }
              </p>

              <p>
                <strong>
                  Customer ID:
                </strong>{" "}
                {order.customer_id}
              </p>

            </div>


            <div className="dashboard-card">

              <h2>
                🌾 Farmer
              </h2>

              <p>
                <strong>
                  Name:
                </strong>{" "}
                {
                  order.farmer?.name ||
                  "Unknown"
                }
              </p>

              <p>
                <strong>
                  Email:
                </strong>{" "}
                {
                  order.farmer?.email ||
                  "N/A"
                }
              </p>

              <p>
                <strong>
                  Farmer ID:
                </strong>{" "}
                {order.farmer_id}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            DELIVERY INFORMATION
        =================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              🚚 Delivery Information
            </h2>

            <p>
              <strong>
                Delivery Address:
              </strong>
            </p>

            <p>
              {
                order.delivery_address ||
                "N/A"
              }
            </p>

            <p>
              <strong>
                Order Created:
              </strong>{" "}
              {order.created_at
                ? new Date(
                    order.created_at
                  ).toLocaleString()
                : "N/A"}
            </p>

          </div>

        </section>


        {/* ===================================================
            PAYMENT INFORMATION
        =================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              💳 Payment Information
            </h2>

            {payment ? (

              <div
                style={{
                  marginTop: "15px",
                }}
              >

                <p>
                  <strong>
                    Payment ID:
                  </strong>{" "}
                  {getPaymentValue([
                    "payment_id",
                    "id",
                  ])}
                </p>

                <p>
                  <strong>
                    Amount:
                  </strong>{" "}
                  Rs.{" "}
                  {Number(
                    getPaymentValue(
                      ["amount"],
                      order.total_price
                    )
                  ).toFixed(2)}
                </p>

                <p>
                  <strong>
                    Payment Method:
                  </strong>{" "}
                  {getPaymentValue([
                    "payment_method",
                    "method",
                  ])}
                </p>

                <p>
                  <strong>
                    Payment Status:
                  </strong>{" "}
                  {getPaymentValue([
                    "payment_status",
                    "status",
                  ])}
                </p>

                <p>
                  <strong>
                    Transaction ID:
                  </strong>{" "}
                  {getPaymentValue([
                    "transaction_id",
                  ])}
                </p>

                <p>
                  <strong>
                    Paid At:
                  </strong>{" "}
                  {getPaymentValue([
                    "paid_at",
                  ])}
                </p>

              </div>

            ) : (

              <div
                style={{
                  marginTop: "15px",
                }}
              >

                <p>
                  No separate payment record
                  was found for this order.
                </p>

                <p>
                  <strong>
                    Order Total:
                  </strong>{" "}
                  Rs.{" "}
                  {Number(
                    order.total_price || 0
                  ).toFixed(2)}
                </p>

              </div>

            )}

          </div>

        </section>


        {/* ===================================================
            ORDER PROGRESS
        =================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              📊 Order Progress
            </h2>

            <div
              style={{
                marginTop: "20px",
              }}
            >

              <p>
                {order.status ===
                "cancelled"
                  ? "❌ Order Cancelled"
                  : "📦 Order Placed"}
              </p>

              {order.status !==
                "cancelled" && (
                <>
                  <p>
                    {[
                      "confirmed",
                      "shipped",
                      "delivered",
                    ].includes(
                      order.status
                    )
                      ? "✅ Confirmed"
                      : "⏳ Waiting for Confirmation"}
                  </p>

                  <p>
                    {[
                      "shipped",
                      "delivered",
                    ].includes(
                      order.status
                    )
                      ? "🚚 Shipped"
                      : "⏳ Waiting for Shipment"}
                  </p>

                  <p>
                    {order.status ===
                    "delivered"
                      ? "✅ Delivered"
                      : "⏳ Waiting for Delivery"}
                  </p>
                </>
              )}

            </div>

          </div>

        </section>


        {/* ===================================================
            ACTIONS
        =================================================== */}

        <section className="dashboard-section">

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >

            <button
              onClick={() =>
                navigate(
                  "/admin/orders"
                )
              }
              className="auth-button"
            >
              ← Back to Orders
            </button>

            <button
              onClick={loadOrderDetails}
              className="auth-button"
            >
              🔄 Refresh
            </button>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="dashboard-footer">

        <p>
          © 2026 GreenChain 🌱
        </p>

        <p>
          Smart Agricultural Marketplace
          for Nepal
        </p>

      </footer>

    </div>
  );
}

export default AdminOrderDetails;