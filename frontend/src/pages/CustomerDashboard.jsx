import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "customer") {
      navigate("/");
      return;
    }

    loadDashboard();
  }, [user, navigate]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, ordersResponse] =
        await Promise.all([
          api.get("/users/dashboard"),
          api.get("/orders/my-orders"),
        ]);

      setDashboard(dashboardResponse.data);

      const data = ordersResponse.data;

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
      console.error("Dashboard error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to load dashboard. Please try again."
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

  const getOrderId = (order) => {
    return order.order_id || order.id;
  };

  const getOrderStatus = (order) => {
    return (
      order.status ||
      order.order_status ||
      "pending"
    ).toLowerCase();
  };

  const getProductName = (order) => {
    return (
      order.product?.name ||
      order.product_name ||
      `Product #${order.product_id || "N/A"}`
    );
  };

  const getTotal = (order) => {
    return Number(
      order.total_price ||
        order.total ||
        order.amount ||
        0
    );
  };

  const formatStatus = (status) => {
    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";

      case "confirmed":
        return "status-confirmed";

      case "shipped":
        return "status-shipped";

      case "delivered":
        return "status-delivered";

      case "cancelled":
        return "status-cancelled";

      default:
        return "status-default";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <nav className="dashboard-navbar">
          <div className="dashboard-logo">
            🌱 GreenChain
          </div>
        </nav>

        <main className="dashboard-container">
          <div className="dashboard-loading">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <nav className="dashboard-navbar">
          <div
            className="dashboard-logo"
            onClick={() => navigate("/")}
          >
            🌱 GreenChain
          </div>
        </nav>

        <main className="dashboard-container">
          <div className="dashboard-error-card">
            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button
              onClick={loadDashboard}
              className="primary-button"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  const totalOrders =
    dashboard?.total_orders ?? orders.length;

  const activeOrders =
    dashboard?.active_orders ??
    orders.filter((order) =>
      ["pending", "confirmed", "shipped"].includes(
        getOrderStatus(order)
      )
    ).length;

  const deliveredOrders =
    dashboard?.delivered_orders ??
    orders.filter(
      (order) =>
        getOrderStatus(order) === "delivered"
    ).length;

  const cancelledOrders =
    dashboard?.cancelled_orders ??
    orders.filter(
      (order) =>
        getOrderStatus(order) === "cancelled"
    ).length;

  const pendingOrders =
    dashboard?.pending_orders ??
    orders.filter(
      (order) =>
        getOrderStatus(order) === "pending"
    ).length;

  const confirmedOrders =
    dashboard?.confirmed_orders ??
    orders.filter(
      (order) =>
        getOrderStatus(order) === "confirmed"
    ).length;

  const shippedOrders =
    dashboard?.shipped_orders ??
    orders.filter(
      (order) =>
        getOrderStatus(order) === "shipped"
    ).length;

  const totalSpent = Number(
    dashboard?.total_spent ?? 0
  );

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}
      <nav className="dashboard-navbar">

        <div
          className="dashboard-logo"
          onClick={() => navigate("/")}
        >
          🌱 GreenChain
        </div>

        <div className="dashboard-nav-links">

          <button onClick={() => navigate("/")}>
            🏠 Home
          </button>

          <button
            onClick={() =>
              navigate("/marketplace")
            }
          >
            🛍️ Marketplace
          </button>

          <button
            onClick={() => navigate("/cart")}
          >
            🛒 Cart
          </button>

          <button
            onClick={() =>
              navigate("/wishlist")
            }
          >
            ❤️ Wishlist
          </button>

          <button
            onClick={() => navigate("/orders")}
          >
            📦 My Orders
          </button>

          <button
            className="active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            📊 Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/profile")
            }
          >
            👤 Profile
          </button>

          <button onClick={handleLogout}>
            🚪 Logout
          </button>

        </div>
      </nav>

      {/* MAIN */}
      <main className="dashboard-container">

        {/* WELCOME */}
        <section className="customer-welcome">

          <div>
            <p className="dashboard-eyebrow">
              CUSTOMER DASHBOARD
            </p>

            <h1>
              👋 Welcome,{" "}
              {user?.name || "Customer"}
            </h1>

            <p>
              Manage your GreenChain account,
              orders and shopping activity.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/marketplace")
            }
            className="primary-button"
          >
            🛍️ Shop Now
          </button>

        </section>

        {/* STATISTICS */}
        <section className="customer-stat-grid">

          <div className="customer-stat-card">
            <div className="customer-stat-icon">
              📦
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{totalOrders}</strong>
            </div>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon">
              🔄
            </div>

            <div>
              <span>Active Orders</span>
              <strong>{activeOrders}</strong>
            </div>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon">
              ✅
            </div>

            <div>
              <span>Delivered</span>
              <strong>{deliveredOrders}</strong>
            </div>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon">
              ❌
            </div>

            <div>
              <span>Cancelled</span>
              <strong>{cancelledOrders}</strong>
            </div>
          </div>

          <div className="customer-stat-card">
            <div className="customer-stat-icon">
              💰
            </div>

            <div>
              <span>Total Spent</span>
              <strong>
                Rs. {totalSpent.toFixed(2)}
              </strong>
            </div>
          </div>

        </section>

        {/* SUMMARY + ACCOUNT */}
        <section className="customer-dashboard-grid">

          {/* ORDER SUMMARY */}
          <div className="customer-panel">

            <div className="customer-panel-header">

              <div>
                <h2>📊 Order Summary</h2>

                <p>
                  Overview of your order activity.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/orders")
                }
                className="secondary-button"
              >
                View All
              </button>

            </div>

            <div className="order-summary-grid">

              <div className="summary-item">
                <span>⏳ Pending</span>
                <strong>{pendingOrders}</strong>
              </div>

              <div className="summary-item">
                <span>🔵 Confirmed</span>
                <strong>{confirmedOrders}</strong>
              </div>

              <div className="summary-item">
                <span>🚚 Shipped</span>
                <strong>{shippedOrders}</strong>
              </div>

              <div className="summary-item">
                <span>✅ Delivered</span>
                <strong>{deliveredOrders}</strong>
              </div>

              <div className="summary-item">
                <span>❌ Cancelled</span>
                <strong>{cancelledOrders}</strong>
              </div>

            </div>

          </div>

          {/* ACCOUNT INFORMATION */}
          <div className="customer-panel">

            <div className="customer-panel-header">

              <div>
                <h2>
                  👤 Account Information
                </h2>

                <p>
                  Your GreenChain account details.
                </p>
              </div>

              <button
                onClick={() =>
                  navigate("/profile")
                }
                className="secondary-button"
              >
                Edit
              </button>

            </div>

            <div className="account-details">

              <div className="account-row">
                <span>Name</span>

                <strong>
                  {user?.name || "N/A"}
                </strong>
              </div>

              <div className="account-row">
                <span>Email</span>

                <strong>
                  {user?.email || "N/A"}
                </strong>
              </div>

              <div className="account-row">
                <span>Phone</span>

                <strong>
                  {user?.phone ||
                    "Not available"}
                </strong>
              </div>

              <div className="account-row">
                <span>Role</span>

                <strong>
                  Customer
                </strong>
              </div>

            </div>

          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="customer-panel">

          <div className="customer-panel-header">

            <div>
              <h2>⚡ Quick Actions</h2>

              <p>
                Quickly access your GreenChain
                features.
              </p>
            </div>

          </div>

          <div className="quick-action-grid">

            <button
              onClick={() =>
                navigate("/marketplace")
              }
              className="quick-action-card"
            >
              <span className="quick-action-icon">
                🛍️
              </span>

              <strong>
                Browse Marketplace
              </strong>

              <small>
                Find fresh products from farmers.
              </small>
            </button>

            <button
              onClick={() =>
                navigate("/cart")
              }
              className="quick-action-card"
            >
              <span className="quick-action-icon">
                🛒
              </span>

              <strong>
                View Cart
              </strong>

              <small>
                Review your selected products.
              </small>
            </button>

            <button
              onClick={() =>
                navigate("/wishlist")
              }
              className="quick-action-card"
            >
              <span className="quick-action-icon">
                ❤️
              </span>

              <strong>
                My Wishlist
              </strong>

              <small>
                View your saved products.
              </small>
            </button>

            <button
              onClick={() =>
                navigate("/orders")
              }
              className="quick-action-card"
            >
              <span className="quick-action-icon">
                📦
              </span>

              <strong>
                My Orders
              </strong>

              <small>
                View your order history.
              </small>
            </button>

            <button
              onClick={() =>
                navigate("/profile")
              }
              className="quick-action-card"
            >
              <span className="quick-action-icon">
                👤
              </span>

              <strong>
                My Profile
              </strong>

              <small>
                Update your account information.
              </small>
            </button>

          </div>

        </section>

        {/* RECENT ORDERS */}
        <section className="customer-panel">

          <div className="customer-panel-header">

            <div>
              <h2>📦 Recent Orders</h2>

              <p>
                Your latest GreenChain orders.
              </p>
            </div>

            <button
              onClick={() =>
                navigate("/orders")
              }
              className="secondary-button"
            >
              View All Orders
            </button>

          </div>

          {recentOrders.length === 0 ? (

            <div className="dashboard-empty">

              <div>🛍️</div>

              <h3>
                No orders yet
              </h3>

              <p>
                Start shopping from the
                GreenChain marketplace.
              </p>

              <button
                onClick={() =>
                  navigate("/marketplace")
                }
                className="primary-button"
              >
                Explore Marketplace
              </button>

            </div>

          ) : (

            <div className="recent-orders-list">

              {recentOrders.map((order) => {

                const orderId =
                  getOrderId(order);

                const status =
                  getOrderStatus(order);

                return (
                  <div
                    key={orderId}
                    className="recent-order-card"
                  >

                    <div className="recent-order-main">

                      <div className="recent-order-icon">
                        📦
                      </div>

                      <div>

                        <h3>
                          Order #{orderId}
                        </h3>

                        <p>
                          {getProductName(order)}
                        </p>

                        <span>
                          Quantity:{" "}
                          {order.quantity || 0}
                        </span>

                      </div>

                    </div>

                    <div className="recent-order-info">

                      <strong>
                        Rs.{" "}
                        {getTotal(order).toFixed(2)}
                      </strong>

                      <span
                        className={
                          "order-status " +
                          getStatusClass(status)
                        }
                      >
                        {formatStatus(status)}
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          `/orders/${orderId}`
                        )
                      }
                      className="secondary-button"
                    >
                      View
                    </button>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </main>

      {/* FOOTER */}
      <footer className="dashboard-footer">

        <div>
          <strong>
            🌱 GreenChain
          </strong>

          <p>
            Smart Agricultural Marketplace
            for Nepal
          </p>
        </div>

        <p>
          © 2026 GreenChain.
          All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default CustomerDashboard;