import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminPayments() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments/");

      console.log("Admin payments:", response.data);

      const data = response.data;

      if (Array.isArray(data)) {
        setPayments(data);
      } else if (Array.isArray(data?.payments)) {
        setPayments(data.payments);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Payment loading error:", err);

      if (err.response?.status === 403) {
        setError("Admin permission required.");
      } else if (err.response?.status === 401) {
        setError("Please login again.");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Unable to load payments.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getPaymentStatus = (payment) => {
    return (
      payment.payment_status ||
      payment.status ||
      "unknown"
    ).toLowerCase();
  };

  const getStatusStyle = (status) => {
    if (status === "paid" || status === "completed") {
      return {
        background: "#d4edda",
        color: "#155724",
      };
    }

    if (status === "pending") {
      return {
        background: "#fff3cd",
        color: "#856404",
      };
    }

    if (
      status === "failed" ||
      status === "cancelled"
    ) {
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

  const filteredPayments = payments.filter(
    (payment) => {
      const status = getPaymentStatus(payment);

      if (
        statusFilter !== "all" &&
        status !== statusFilter
      ) {
        return false;
      }

      const searchText = search
        .toLowerCase()
        .trim();

      if (!searchText) {
        return true;
      }

      const searchableText = [
        payment.payment_id,
        payment.id,
        payment.order_id,
        payment.amount,
        payment.payment_method,
        payment.method,
        payment.payment_status,
        payment.status,
        payment.transaction_id,
      ]
        .filter(
          (value) =>
            value !== undefined &&
            value !== null
        )
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchText);
    }
  );

  const totalAmount = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  const paidPayments = payments.filter(
    (payment) =>
      getPaymentStatus(payment) === "paid"
  );

  const pendingPayments = payments.filter(
    (payment) =>
      getPaymentStatus(payment) === "pending"
  );

  const failedPayments = payments.filter(
    (payment) =>
      ["failed", "cancelled"].includes(
        getPaymentStatus(payment)
      )
  );

  const paidAmount = paidPayments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

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
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/admin/users")
            }
          >
            Users
          </button>

          <button
            onClick={() =>
              navigate("/admin/products")
            }
          >
            Products
          </button>

          <button
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            Orders
          </button>

          <button
            onClick={() =>
              navigate("/admin/payments")
            }
          >
            Payments
          </button>

          <button
            onClick={() =>
              navigate("/marketplace")
            }
          >
            Marketplace
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>

        </div>

      </nav>

      {/* MAIN */}

      <main className="dashboard-container">

        <div className="dashboard-header">

          <div>

            <h1>
              Payment Management 💳
            </h1>

            <p>
              Monitor GreenChain customer
              payments and transactions.
            </p>

          </div>

          <button
            onClick={loadPayments}
            className="auth-button"
          >
            🔄 Refresh
          </button>

        </div>

        {/* STATISTICS */}

        <section className="dashboard-section">

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h3>
                Total Payments
              </h3>

              <p className="dashboard-number">
                {payments.length}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                Paid
              </h3>

              <p className="dashboard-number">
                {paidPayments.length}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                Pending
              </h3>

              <p className="dashboard-number">
                {pendingPayments.length}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                Failed / Cancelled
              </h3>

              <p className="dashboard-number">
                {failedPayments.length}
              </p>

            </div>

          </div>

        </section>

        {/* AMOUNT STATISTICS */}

        <section className="dashboard-section">

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h3>
                Total Payment Value
              </h3>

              <p className="dashboard-number">
                Rs.{" "}
                {totalAmount.toFixed(2)}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                Paid Amount
              </h3>

              <p className="dashboard-number">
                Rs.{" "}
                {paidAmount.toFixed(2)}
              </p>

            </div>

          </div>

        </section>

        {/* SEARCH AND FILTER */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              Search Payments
            </h2>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "15px",
              }}
            >

              <input
                type="text"
                placeholder="Search payment, order, transaction..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                style={{
                  flex: "1",
                  minWidth: "250px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              >

                <option value="all">
                  All Statuses
                </option>

                <option value="paid">
                  Paid
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="failed">
                  Failed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

              </select>

            </div>

          </div>

        </section>

        {/* PAYMENT TABLE */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              Payments
            </h2>

            {loading ? (

              <p>
                Loading payments...
              </p>

            ) : error ? (

              <div>

                <p className="error-message">
                  {error}
                </p>

                <button
                  onClick={loadPayments}
                  className="auth-button"
                >
                  Try Again
                </button>

              </div>

            ) : filteredPayments.length === 0 ? (

              <p>
                No payments found.
              </p>

            ) : (

              <div
                style={{
                  overflowX: "auto",
                  marginTop: "20px",
                }}
              >

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >

                  <thead>

                    <tr>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                        }}
                      >
                        Payment ID
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                        }}
                      >
                        Order ID
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                        }}
                      >
                        Amount
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                        }}
                      >
                        Method
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                        }}
                      >
                        Status
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                        }}
                      >
                        Transaction ID
                      </th>

                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                        }}
                      >
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredPayments.map(
                      (payment, index) => {

                        const status =
                          getPaymentStatus(
                            payment
                          );

                        const paymentId =
                          payment.payment_id ||
                          payment.id ||
                          `payment-${index}`;

                        const orderId =
                          payment.order_id;

                        return (
                          <tr
                            key={paymentId}
                          >

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >
                              #
                              {payment.payment_id ||
                                payment.id ||
                                "N/A"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >
                              {orderId
                                ? `#${orderId}`
                                : "N/A"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >
                              Rs.{" "}
                              {Number(
                                payment.amount || 0
                              ).toFixed(2)}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >
                              {payment.payment_method ||
                                payment.method ||
                                "N/A"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >

                              <span
                                style={{
                                  ...getStatusStyle(
                                    status
                                  ),
                                  padding:
                                    "6px 10px",
                                  borderRadius:
                                    "6px",
                                  fontWeight:
                                    "600",
                                }}
                              >
                                {status
                                  .charAt(0)
                                  .toUpperCase() +
                                  status.slice(1)}
                              </span>

                            </td>

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >
                              {payment.transaction_id ||
                                "N/A"}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >

                              <button
                                onClick={() =>
                                  navigate(
                                    "/admin/orders"
                                  )
                                }
                                className="auth-button"
                                disabled={!orderId}
                                title={
                                  orderId
                                    ? "View orders"
                                    : "Order ID unavailable"
                                }
                              >
                                {orderId
                                  ? "View Order"
                                  : "No Order"}
                              </button>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

      </main>

      {/* FOOTER */}

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

export default AdminPayments;