import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function FarmerDashboard() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (user?.role !== "farmer") {
      setError(
        "Access denied. Only farmer accounts can access this dashboard."
      );
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          dashboardResponse,
          productsResponse,
          ordersResponse,
        ] = await Promise.all([
          api.get("/farmer/dashboard"),
          api.get("/farmer/products/"),
          api.get("/orders/farmer-orders"),
        ]);

        console.log(
          "Farmer dashboard:",
          dashboardResponse.data
        );

        console.log(
          "Farmer products:",
          productsResponse.data
        );

        console.log(
          "Farmer orders:",
          ordersResponse.data
        );

        setDashboard(dashboardResponse.data);

        setProducts(
          Array.isArray(productsResponse.data)
            ? productsResponse.data
            : []
        );

        setOrders(
          Array.isArray(ordersResponse.data)
            ? ordersResponse.data
            : []
        );
      } catch (err) {
        console.error(
          "Farmer dashboard error:",
          err
        );

        if (err.response?.status === 401) {
          setError(
            "Your login session has expired. Please login again."
          );
        } else if (err.response?.status === 403) {
          setError(
            "You do not have permission to access the farmer dashboard."
          );
        } else if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError(
            "Unable to load the farmer dashboard."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [
    isLoggedIn,
    user,
    navigate,
  ]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const getStatusClass = (status) => {
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

  /*
   * ============================
   * ORDER STATISTICS
   * ============================
   */

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending"
  ).length;

  const confirmedOrders = orders.filter(
    (order) =>
      order.status === "confirmed"
  ).length;

  const shippedOrders = orders.filter(
    (order) =>
      order.status === "shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.status === "delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      order.status === "cancelled"
  ).length;

  const activeOrders =
    pendingOrders +
    confirmedOrders +
    shippedOrders;

  /*
   * ============================
   * SALES
   * ============================
   */

  const totalSales = orders
    .filter(
      (order) =>
        order.status !== "cancelled"
    )
    .reduce(
      (total, order) =>
        total +
        Number(order.total_price || 0),
      0
    );

  /*
   * ============================
   * INVENTORY
   * ============================
   */

  const totalInventory = products.reduce(
    (total, product) =>
      total +
      Number(product.quantity || 0),
    0
  );

  const availableProducts = products.filter(
    (product) =>
      product.is_available
  ).length;

  const unavailableProducts =
    products.length -
    availableProducts;

  if (loading) {
    return (
      <div className="marketplace-page">

        <div className="container">

          <div className="page-header">

            <h1>
              👨‍🌾 Farmer Dashboard
            </h1>

            <p>
              Loading your dashboard...
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="marketplace-page">

      {/* ================= NAVBAR ================= */}

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
              🏠 Home
            </Link>

            <Link to="/marketplace">
              🛍️ Marketplace
            </Link>

            <Link to="/farmer/dashboard">
              👨‍🌾 Dashboard
            </Link>

            <Link to="/farmer/products">
              🌾 Products
            </Link>

            <Link to="/farmer/orders">
              📦 Orders
            </Link>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>

          </div>

        </div>

      </nav>


      {/* ================= HEADER ================= */}

      <section className="marketplace-header">

        <div className="container">

          <h1>
            👨‍🌾 Farmer Dashboard
          </h1>

          <p>
            Manage your GreenChain farm
            marketplace.
          </p>

        </div>

      </section>


      <div className="container">

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {!error && (
          <>

            {/* ================= WELCOME ================= */}

            <section className="dashboard-welcome">

              <h2>
                Welcome,{" "}
                {user?.name || "Farmer"}! 🌱
              </h2>

              <p>
                Manage your products,
                inventory, sales and customer
                orders from one place.
              </p>

            </section>


            {/* ================= STATISTICS ================= */}

            <section className="dashboard-stats">

              {/* Products */}

              <div className="stat-card">

                <span className="stat-icon">
                  🌾
                </span>

                <h3>
                  Products
                </h3>

                <p>
                  {products.length}
                </p>

              </div>


              {/* Orders */}

              <div className="stat-card">

                <span className="stat-icon">
                  📦
                </span>

                <h3>
                  Orders
                </h3>

                <p>
                  {totalOrders}
                </p>

              </div>


              {/* Active Orders */}

              <div className="stat-card">

                <span className="stat-icon">
                  🔄
                </span>

                <h3>
                  Active Orders
                </h3>

                <p>
                  {activeOrders}
                </p>

              </div>


              {/* Delivered */}

              <div className="stat-card">

                <span className="stat-icon">
                  ✅
                </span>

                <h3>
                  Delivered
                </h3>

                <p>
                  {deliveredOrders}
                </p>

              </div>


              {/* Sales */}

              <div className="stat-card">

                <span className="stat-icon">
                  💰
                </span>

                <h3>
                  Sales
                </h3>

                <p>
                  Rs. {totalSales}
                </p>

              </div>


              {/* Inventory */}

              <div className="stat-card">

                <span className="stat-icon">
                  📊
                </span>

                <h3>
                  Inventory
                </h3>

                <p>
                  {totalInventory}
                </p>

              </div>

            </section>


            {/* ================= ORDER STATUS ================= */}

            <section className="dashboard-info">

              <h2>
                📊 Order Status Summary
              </h2>

              <div className="order-details">

                <p>
                  <strong>
                    ⏳ Pending:
                  </strong>{" "}
                  {pendingOrders}
                </p>

                <p>
                  <strong>
                    🔵 Confirmed:
                  </strong>{" "}
                  {confirmedOrders}
                </p>

                <p>
                  <strong>
                    🚚 Shipped:
                  </strong>{" "}
                  {shippedOrders}
                </p>

                <p>
                  <strong>
                    ✅ Delivered:
                  </strong>{" "}
                  {deliveredOrders}
                </p>

                <p>
                  <strong>
                    ❌ Cancelled:
                  </strong>{" "}
                  {cancelledOrders}
                </p>

                <p>
                  <strong>
                    💰 Total Sales:
                  </strong>{" "}
                  Rs. {totalSales}
                </p>

              </div>

            </section>


            {/* ================= INVENTORY ================= */}

            <section className="dashboard-info">

              <h2>
                📦 Inventory Summary
              </h2>

              <div className="order-details">

                <p>
                  <strong>
                    Total Products:
                  </strong>{" "}
                  {products.length}
                </p>

                <p>
                  <strong>
                    Available Products:
                  </strong>{" "}
                  {availableProducts}
                </p>

                <p>
                  <strong>
                    Unavailable Products:
                  </strong>{" "}
                  {unavailableProducts}
                </p>

                <p>
                  <strong>
                    Total Inventory Quantity:
                  </strong>{" "}
                  {totalInventory}
                </p>

              </div>

            </section>


            {/* ================= ACCOUNT ================= */}

            {dashboard && (
              <section className="dashboard-info">

                <h2>
                  👤 Account Information
                </h2>

                <p>
                  <strong>
                    User ID:
                  </strong>{" "}
                  {dashboard.user_id}
                </p>

                <p>
                  <strong>
                    Role:
                  </strong>{" "}
                  {dashboard.role}
                </p>

              </section>
            )}


            {/* ================= PRODUCTS ================= */}

            <section className="dashboard-section">

              <div className="section-header">

                <div>

                  <h2>
                    🌾 My Products
                  </h2>

                  <p>
                    Manage products you are
                    selling.
                  </p>

                </div>

                <Link
                  to="/farmer/products"
                  className="primary-button"
                >
                  Manage Products
                </Link>

              </div>


              {products.length === 0 ? (

                <div className="empty-cart">

                  <h3>
                    No products yet.
                  </h3>

                  <p>
                    Add your first agricultural
                    product to GreenChain.
                  </p>

                  <Link
                    to="/farmer/products"
                    className="primary-button"
                  >
                    Add Product
                  </Link>

                </div>

              ) : (

                <div className="orders-container">

                  {products
                    .slice(0, 5)
                    .map((product) => (

                      <div
                        className="order-card"
                        key={product.id}
                      >

                        <div className="order-header">

                          <h3>
                            {product.name}
                          </h3>

                          <span>
                            Rs.{" "}
                            {product.price}
                            {" / "}
                            {product.unit}
                          </span>

                        </div>

                        <div className="order-details">

                          <p>
                            <strong>
                              Category:
                            </strong>{" "}
                            {product.category}
                          </p>

                          <p>
                            <strong>
                              Quantity:
                            </strong>{" "}
                            {product.quantity}
                          </p>

                          <p>
                            <strong>
                              Location:
                            </strong>{" "}
                            {product.location}
                          </p>

                          <p>
                            <strong>
                              Available:
                            </strong>{" "}
                            {product.is_available
                              ? "Yes"
                              : "No"}
                          </p>

                        </div>

                      </div>

                    ))}

                </div>

              )}

            </section>


            {/* ================= CUSTOMER ORDERS ================= */}

            <section className="dashboard-section">

              <div className="section-header">

                <div>

                  <h2>
                    📦 Customer Orders
                  </h2>

                  <p>
                    View orders placed for
                    your products.
                  </p>

                </div>

                <Link
                  to="/farmer/orders"
                  className="primary-button"
                >
                  Manage Orders
                </Link>

              </div>


              {orders.length === 0 ? (

                <div className="empty-cart">

                  <h3>
                    No customer orders yet.
                  </h3>

                  <p>
                    Customer orders will
                    appear here.
                  </p>

                </div>

              ) : (

                <div className="orders-container">

                  {orders
                    .slice(0, 5)
                    .map((order) => (

                      <div
                        className="order-card"
                        key={order.id}
                      >

                        <div className="order-header">

                          <h3>
                            Order #{order.id}
                          </h3>

                          <span
                            className={getStatusClass(
                              order.status
                            )}
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
                            {order.customer_id}
                          </p>

                          <p>
                            <strong>
                              Product ID:
                            </strong>{" "}
                            {order.product_id}
                          </p>

                          <p>
                            <strong>
                              Quantity:
                            </strong>{" "}
                            {order.quantity}
                          </p>

                          <p>
                            <strong>
                              Total:
                            </strong>{" "}
                            Rs.{" "}
                            {order.total_price}
                          </p>

                          <p>
                            <strong>
                              Delivery:
                            </strong>{" "}
                            {order.delivery_address}
                          </p>

                        </div>

                      </div>

                    ))}

                </div>

              )}

            </section>


            {/* ================= QUICK ACTIONS ================= */}

            <section className="dashboard-section">

              <div className="section-header">

                <div>

                  <h2>
                    ⚡ Quick Actions
                  </h2>

                  <p>
                    Manage your GreenChain
                    business.
                  </p>

                </div>

              </div>


              <div className="order-actions">

                <Link
                  to="/farmer/products"
                  className="primary-button"
                >
                  🌾 Manage Products
                </Link>

                <Link
                  to="/farmer/orders"
                  className="secondary-button"
                >
                  📦 Manage Orders
                </Link>

                <Link
                  to="/marketplace"
                  className="secondary-button"
                >
                  🛍️ View Marketplace
                </Link>

              </div>

            </section>

          </>
        )}

      </div>


      {/* ================= FOOTER ================= */}

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

export default FarmerDashboard;