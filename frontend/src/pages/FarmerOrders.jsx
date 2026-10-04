import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function FarmerOrders() {
  const navigate = useNavigate();

  const { user, isLoggedIn } = useAuth();

  const { showNotification } = useNotification();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/orders/farmer-orders"
      );

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
      console.error(
        "Error loading farmer orders:",
        err
      );

      const detail =
        err.response?.data?.detail;

      setError(
        detail ||
          "Failed to load customer orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (user.role !== "farmer") {
      navigate("/", {
        replace: true,
      });

      return;
    }

    loadOrders();
  }, [
    isLoggedIn,
    user,
    navigate,
    loadOrders,
  ]);

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

  const getNextStatus = (status) => {
    switch (status) {
      case "pending":
        return "confirmed";

      case "confirmed":
        return "shipped";

      case "shipped":
        return "delivered";

      default:
        return null;
    }
  };

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    if (!newStatus) {
      return;
    }

    const order = orders.find(
      (item) => item.id === orderId
    );

    if (!order) {
      return;
    }

    const currentStatus =
      order.status || "pending";

    const expectedNextStatus =
      getNextStatus(currentStatus);

    if (
      newStatus !== expectedNextStatus
    ) {
      showNotification(
        `Order status must move from ${formatStatus(
          currentStatus
        )} to ${formatStatus(
          expectedNextStatus
        )}.`,
        "warning"
      );

      return;
    }

    try {
      setError("");
      setUpdatingOrderId(orderId);

      const response = await api.put(
        `/orders/farmer-orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      const updatedStatus =
        response.data?.status ||
        newStatus;

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item.id === orderId
            ? {
                ...item,
                status: updatedStatus,
              }
            : item
        )
      );

      showNotification(
        `Order #${orderId} updated to ${formatStatus(
          updatedStatus
        )}.`,
        "success"
      );
    } catch (err) {
      console.error(
        "Error updating order status:",
        err
      );

      const detail =
        err.response?.data?.detail;

      setError(
        detail ||
          "Failed to update order status."
      );

      showNotification(
        detail ||
          "Failed to update order status.",
        "error"
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getOrderActionText = (status) => {
    switch (status) {
      case "pending":
        return "Confirm Order";

      case "confirmed":
        return "Mark as Shipped";

      case "shipped":
        return "Mark as Delivered";

      default:
        return "";
    }
  };

  if (!isLoggedIn || !user) {
    return null;
  }

  if (user.role !== "farmer") {
    return null;
  }

  return (
    <div className="farmer-orders-page">

      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-container">

          <Link
            to="/"
            className="logo"
          >
            🌱 GreenChain
          </Link>

          <nav>
            <Link to="/">
              Home
            </Link>

            <Link to="/marketplace">
              Marketplace
            </Link>

            <Link to="/farmer/dashboard">
              Dashboard
            </Link>

            <Link to="/farmer/products">
              My Products
            </Link>

            <Link to="/farmer/orders">
              Orders
            </Link>
          </nav>

        </div>
      </header>

      {/* Main */}
      <main className="farmer-orders-container">

        <div className="page-header">

          <div>
            <h1>
              📦 Customer Orders
            </h1>

            <p>
              View and manage orders received
              from customers.
            </p>
          </div>

          <Link
            to="/farmer/dashboard"
            className="secondary-button"
          >
            ← Dashboard
          </Link>

        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Orders */}
        <section className="orders-section">

          <div className="section-header">

            <h2>
              Orders ({orders.length})
            </h2>

            <button
              type="button"
              className="secondary-button"
              onClick={loadOrders}
              disabled={loading}
            >
              {loading
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

          </div>

          {loading ? (
            <div className="loading-state">
              <p>
                Loading customer orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">

              <div className="empty-icon">
                📦
              </div>

              <h3>
                No customer orders yet
              </h3>

              <p>
                Orders from customers will
                appear here.
              </p>

              <Link
                to="/farmer/products"
                className="primary-button"
              >
                Manage My Products
              </Link>

            </div>
          ) : (
            <div className="farmer-orders-list">

              {orders.map((order) => {

                const status =
                  order.status ||
                  "pending";

                const nextStatus =
                  getNextStatus(status);

                const isUpdating =
                  updatingOrderId ===
                  order.id;

                const canUpdate =
                  !!nextStatus &&
                  status !== "cancelled" &&
                  status !== "delivered";

                return (
                  <article
                    className="farmer-order-card"
                    key={order.id}
                  >

                    {/* Order Header */}
                    <div className="order-header">

                      <div>
                        <h3>
                          Order #{order.id}
                        </h3>

                        <p>
                          Customer ID:{" "}
                          {order.customer_id ??
                            "N/A"}
                        </p>
                      </div>

                      <span
                        className={`order-status ${getStatusClass(
                          status
                        )}`}
                      >
                        {formatStatus(
                          status
                        )}
                      </span>

                    </div>

                    {/* Order Details */}
                    <div className="order-details">

                      <div>
                        <strong>
                          Product
                        </strong>

                        <span>
                          Product #
                          {order.product_id ??
                            "N/A"}
                        </span>
                      </div>

                      <div>
                        <strong>
                          Quantity
                        </strong>

                        <span>
                          {order.quantity ??
                            "N/A"}
                        </span>
                      </div>

                      <div>
                        <strong>
                          Total Price
                        </strong>

                        <span>
                          Rs.{" "}
                          {order.total_price ??
                            order.amount ??
                            "0"}
                        </span>
                      </div>

                      <div>
                        <strong>
                          Delivery Address
                        </strong>

                        <span>
                          📍{" "}
                          {order.delivery_address ||
                            "Not provided"}
                        </span>
                      </div>

                    </div>

                    {/* Status Action */}
                    {canUpdate && (
                      <div className="order-status-actions">

                        <label>
                          Order Progress
                        </label>

                        <div className="order-status-update-row">

                          <div>
                            <span>
                              Current status:
                            </span>

                            <strong>
                              {" "}
                              {formatStatus(
                                status
                              )}
                            </strong>
                          </div>

                          <button
                            type="button"
                            className="primary-button"
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              handleStatusChange(
                                order.id,
                                nextStatus
                              )
                            }
                          >
                            {isUpdating
                              ? "Updating..."
                              : getOrderActionText(
                                  status
                                )}
                          </button>

                        </div>

                        <p className="status-help-text">
                          Next step:{" "}
                          <strong>
                            {formatStatus(
                              nextStatus
                            )}
                          </strong>
                        </p>

                      </div>
                    )}

                    {/* Cancelled */}
                    {status ===
                      "cancelled" && (
                      <div className="cancelled-notice">
                        ❌ This order was
                        cancelled by the
                        customer.
                      </div>
                    )}

                    {/* Delivered */}
                    {status ===
                      "delivered" && (
                      <div className="delivered-notice">
                        ✅ This order has been
                        delivered successfully.
                      </div>
                    )}

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <footer className="footer">

        <p>
          🌱 GreenChain — Smart Agricultural
          Marketplace for Nepal
        </p>

        <p>
          © 2026 GreenChain. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default FarmerOrders;