import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function AdminDashboard() {
  const navigate = useNavigate();

  const { user, isLoggedIn, logout } = useAuth();

  const { showNotification } = useNotification();

  const [dashboard, setDashboard] = useState(null);
  const [orderStats, setOrderStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD ADMIN DASHBOARD
  // =========================================================

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardResponse,
        orderStatsResponse,
      ] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/orders/statistics"),
      ]);

      console.log(
        "GreenChain admin dashboard:",
        dashboardResponse.data
      );

      console.log(
        "GreenChain order statistics:",
        orderStatsResponse.data
      );

      setDashboard(dashboardResponse.data);
      setOrderStats(orderStatsResponse.data);

    } catch (err) {
      console.error(
        "Admin dashboard error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your admin session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to access the admin dashboard."
        );
      } else if (err.response?.data?.detail) {
        setError(
          err.response.data.detail
        );
      } else {
        setError(
          "Unable to load admin dashboard. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  }, []);

  // =========================================================
  // AUTH CHECK
  // =========================================================

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (user.role !== "admin") {
      navigate("/", {
        replace: true,
      });

      return;
    }

    loadDashboard();

  }, [
    isLoggedIn,
    user,
    navigate,
    loadDashboard,
  ]);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    logout();

    showNotification(
      "You have been logged out.",
      "success"
    );

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (
    !isLoggedIn ||
    !user ||
    user.role !== "admin"
  ) {
    return null;
  }

  if (loading) {
    return (
      <div className="dashboard-page">

        <nav className="dashboard-navbar">

          <div className="dashboard-logo">
            🌱 GreenChain Admin
          </div>

        </nav>

        <main className="dashboard-container">

          <div className="dashboard-card">

            <h2>
              Loading Admin Dashboard...
            </h2>

            <p>
              Please wait while GreenChain
              loads your administration data.
            </p>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="dashboard-page">

        <nav className="dashboard-navbar">

          <div className="dashboard-logo">
            🌱 GreenChain Admin
          </div>

        </nav>

        <main className="dashboard-container">

          <div className="dashboard-card">

            <h2>
              Dashboard Error
            </h2>

            <p className="error-message">
              {error}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >

              <button
                type="button"
                onClick={loadDashboard}
                className="auth-button"
              >
                🔄 Try Again
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="secondary-button"
              >
                Logout
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // SAFE DATA EXTRACTION
  // =========================================================

  const usersData =
    dashboard?.users || {};

  const productsData =
    dashboard?.products || {};

  const ordersData =
    dashboard?.orders || {};

  const salesData =
    dashboard?.sales || {};

  // IMPORTANT:
  // Every value below is now extracted from the
  // backend object instead of rendering the object itself.

  const totalUsers =
    Number(usersData.total || 0);

  const totalCustomers =
    Number(usersData.customers || 0);

  const totalFarmers =
    Number(usersData.farmers || 0);

  const totalAdmins =
    Number(usersData.admins || 0);

  const totalProducts =
    Number(productsData.total || 0);

  const availableProducts =
    Number(productsData.available || 0);

  const totalOrders =
    Number(
      orderStats?.total_orders ??
      ordersData.total ??
      0
    );

  const pendingOrders =
    Number(
      orderStats?.pending ??
      ordersData.pending ??
      0
    );

  const confirmedOrders =
    Number(
      orderStats?.confirmed ??
      ordersData.confirmed ??
      0
    );

  const shippedOrders =
    Number(
      orderStats?.shipped ??
      ordersData.shipped ??
      0
    );

  const deliveredOrders =
    Number(
      orderStats?.delivered ??
      ordersData.delivered ??
      0
    );

  const cancelledOrders =
    Number(
      orderStats?.cancelled ??
      ordersData.cancelled ??
      0
    );

  const completedSales =
    Number(
      orderStats?.completed_sales ??
      salesData.total_sales ??
      0
    );

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav className="dashboard-navbar">

        <div
          className="dashboard-logo"
          onClick={() =>
            navigate("/admin/dashboard")
          }
          style={{
            cursor: "pointer",
          }}
        >
          🌱 GreenChain Admin
        </div>

        <div className="dashboard-nav-links">

          <button
            type="button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/users")
            }
          >
            Users
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/products")
            }
          >
            Products
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            Orders
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/payments")
            }
          >
            Payments
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/marketplace")
            }
          >
            Marketplace
          </button>

          <button
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="dashboard-container">

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <h1>
              Admin Dashboard 🛠️
            </h1>

            <p>
              Complete GreenChain marketplace
              administration overview.
            </p>

          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="auth-button"
          >
            🔄 Refresh
          </button>

        </div>


        {/* ===================================================
            PLATFORM OVERVIEW
        ==================================================== */}

        <section className="dashboard-section">

          <h2>
            Platform Overview
          </h2>

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h3>
                👥 Total Users
              </h3>

              <p className="dashboard-number">
                {totalUsers}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                🛍️ Customers
              </h3>

              <p className="dashboard-number">
                {totalCustomers}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                🌾 Farmers
              </h3>

              <p className="dashboard-number">
                {totalFarmers}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                🛡️ Admins
              </h3>

              <p className="dashboard-number">
                {totalAdmins}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            PRODUCT OVERVIEW
        ==================================================== */}

        <section className="dashboard-section">

          <h2>
            Product Overview 🌾
          </h2>

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h3>
                🛒 Total Products
              </h3>

              <p className="dashboard-number">
                {totalProducts}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                ✅ Available Products
              </h3>

              <p className="dashboard-number">
                {availableProducts}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            ORDER OVERVIEW
        ==================================================== */}

        <section className="dashboard-section">

          <h2>
            Order Overview 📦
          </h2>

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h3>
                📦 Total Orders
              </h3>

              <p className="dashboard-number">
                {totalOrders}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                ⏳ Pending
              </h3>

              <p className="dashboard-number">
                {pendingOrders}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                ✅ Confirmed
              </h3>

              <p className="dashboard-number">
                {confirmedOrders}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                🚚 Shipped
              </h3>

              <p className="dashboard-number">
                {shippedOrders}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                📬 Delivered
              </h3>

              <p className="dashboard-number">
                {deliveredOrders}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                ❌ Cancelled
              </h3>

              <p className="dashboard-number">
                {cancelledOrders}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            SALES OVERVIEW
        ==================================================== */}

        <section className="dashboard-section">

          <h2>
            Sales Overview 💰
          </h2>

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h3>
                Completed Sales
              </h3>

              <p className="dashboard-number">
                NPR{" "}
                {completedSales.toFixed(2)}
              </p>

              <p>
                Based on delivered orders.
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                Currency
              </h3>

              <p className="dashboard-number">
                NPR
              </p>

              <p>
                Nepalese Rupees
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            QUICK ADMINISTRATION
        ==================================================== */}

        <section className="dashboard-section">

          <h2>
            Quick Administration
          </h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >

            <button
              type="button"
              className="auth-button"
              onClick={() =>
                navigate("/admin/users")
              }
            >
              👥 Manage Users
            </button>

            <button
              type="button"
              className="auth-button"
              onClick={() =>
                navigate("/admin/products")
              }
            >
              🌾 Manage Products
            </button>

            <button
              type="button"
              className="auth-button"
              onClick={() =>
                navigate("/admin/orders")
              }
            >
              📦 Manage Orders
            </button>

            <button
              type="button"
              className="auth-button"
              onClick={() =>
                navigate("/admin/payments")
              }
            >
              💳 Manage Payments
            </button>

            <button
              type="button"
              className="auth-button"
              onClick={() =>
                navigate("/marketplace")
              }
            >
              🛒 Open Marketplace
            </button>

          </div>

        </section>


        {/* ===================================================
            ADMIN INFORMATION
        ==================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              🔐 Administration
            </h2>

            <p>
              Logged in as:{" "}
              <strong>
                {user.email ||
                  "GreenChain Admin"}
              </strong>
            </p>

            <p>
              User ID:{" "}
              <strong>
                {user.user_id || "15"}
              </strong>
            </p>

            <p>
              Role:{" "}
              <strong>
                Administrator
              </strong>
            </p>

            <p>
              GreenChain administration
              provides centralized management
              of users, farmers, products,
              orders, payments and platform
              statistics.
            </p>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}

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

export default AdminDashboard;