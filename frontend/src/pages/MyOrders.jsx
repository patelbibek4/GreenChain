import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function MyOrders() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // LOAD CUSTOMER ORDERS
  // ==========================================

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (user?.role !== "customer") {
      setError("Only customer accounts can view customer orders.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/orders/my-orders");

        console.log("My Orders response:", response.data);

        const data = response.data;

        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data?.orders)) {
          setOrders(data.orders);
        } else if (Array.isArray(data?.items)) {
          setOrders(data.items);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("My Orders error:", err);

        if (err.response?.status === 401) {
          setError(
            "Your login session has expired. Please login again."
          );
        } else if (err.response?.data?.detail) {
          const detail = err.response.data.detail;

          if (typeof detail === "string") {
            setError(detail);
          } else if (Array.isArray(detail)) {
            setError(
              detail
                .map((item) =>
                  typeof item === "string"
                    ? item
                    : item?.msg || "Validation error"
                )
                .join(", ")
            );
          } else {
            setError("Unable to load your orders.");
          }
        } else {
          setError("Unable to load your orders.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, user, navigate]);

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    const normalizedStatus =
      String(status || "pending").toLowerCase();

    if (normalizedStatus === "delivered") {
      return "status-delivered";
    }

    if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled"
    ) {
      return "status-cancelled";
    }

    if (normalizedStatus === "shipped") {
      return "status-shipped";
    }

    if (normalizedStatus === "confirmed") {
      return "status-confirmed";
    }

    return "status-pending";
  };

  // ==========================================
  // FORMAT STATUS
  // ==========================================

  const formatStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return String(status)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="marketplace-page">
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="logo">
              🌱 GreenChain
            </Link>
          </div>
        </nav>

        <section className="marketplace-header">
          <div className="container">
            <h1>📦 My Orders</h1>
            <p>Loading your orders...</p>
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

          <Link to="/" className="logo">
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
            📦 My Orders
          </h1>

          <p>
            View and track your GreenChain orders.
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

          {/* EMPTY */}

          {!error && orders.length === 0 && (
            <div className="empty-cart">

              <h2>
                No orders yet 📦
              </h2>

              <p>
                You have not placed any orders yet.
              </p>

              <Link
                to="/marketplace"
                className="primary-button"
              >
                Browse Marketplace
              </Link>

            </div>
          )}

          {/* ORDERS */}

          {orders.length > 0 && (

            <div className="orders-grid">

              {orders.map((order) => {

                const orderId =
                  order.id ||
                  order.order_id;

                const product =
                  order.product || {};

                const productName =
                  product.name ||
                  order.product_name ||
                  "Agricultural Product";

                const quantity =
                  Number(
                    order.quantity || 0
                  );

                const totalPrice =
                  Number(
                    order.total_price ||
                    order.amount ||
                    0
                  );

                const status =
                  order.status ||
                  "pending";

                const deliveryAddress =
                  order.delivery_address ||
                  order.address ||
                  "Address not available";

                return (

                  <div
                    className="order-card"
                    key={orderId}
                  >

                    <div className="order-card-header">

                      <h2>
                        Order #{orderId}
                      </h2>

                      <span
                        className={`status-badge ${getStatusClass(
                          status
                        )}`}
                      >
                        {formatStatus(status)}
                      </span>

                    </div>

                    <div className="order-card-body">

                      <p>
                        <strong>
                          Product:
                        </strong>{" "}
                        {productName}
                      </p>

                      <p>
                        <strong>
                          Quantity:
                        </strong>{" "}
                        {quantity}
                      </p>

                      <p>
                        <strong>
                          Total:
                        </strong>{" "}
                        Rs. {totalPrice}
                      </p>

                      <p>
                        <strong>
                          Delivery:
                        </strong>{" "}
                        {deliveryAddress}
                      </p>

                    </div>

                    <div className="order-card-actions">

                      <Link
                        to={`/orders/${orderId}`}
                        className="secondary-button"
                      >
                        👁️ View Order
                      </Link>

                      <Link
                        to={`/orders/${orderId}/tracking`}
                        className="primary-button"
                      >
                        🚚 Track Order
                      </Link>

                    </div>

                  </div>

                );
              })}

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

export default MyOrders;