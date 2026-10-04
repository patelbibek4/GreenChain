import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminOrders() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [detailsError, setDetailsError] =
    useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/orders"
      );

      console.log(
        "Admin orders response:",
        response.data
      );

      setOrders(
        response.data?.orders || []
      );
    } catch (err) {
      console.error(
        "Admin orders error:",
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
      } else if (err.response?.data?.detail) {
        setError(
          err.response.data.detail
        );
      } else {
        setError(
          "Unable to load orders."
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

  const handleViewDetails = async (
    orderId
  ) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedOrder(null);

      const response = await api.get(
        `/admin/orders/${orderId}`
      );

      console.log(
        "Admin order details:",
        response.data
      );

      setSelectedOrder(response.data);
    } catch (err) {
      console.error(
        "Admin order details error:",
        err
      );

      if (err.response?.status === 401) {
        setDetailsError(
          "Your admin session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setDetailsError(
          "Access denied. Admin permission required."
        );
      } else if (err.response?.status === 404) {
        setDetailsError(
          "Order not found."
        );
      } else if (err.response?.data?.detail) {
        setDetailsError(
          err.response.data.detail
        );
      } else {
        setDetailsError(
          "Unable to load order details."
        );
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedOrder(null);
    setDetailsError("");
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

  const getStatusStyle = (status) => {
    if (status === "pending") {
      return {
        background: "#fff3cd",
        color: "#856404",
        padding: "6px 10px",
        borderRadius: "6px",
        display: "inline-block",
        fontWeight: "600",
      };
    }

    if (status === "confirmed") {
      return {
        background: "#d1ecf1",
        color: "#0c5460",
        padding: "6px 10px",
        borderRadius: "6px",
        display: "inline-block",
        fontWeight: "600",
      };
    }

    if (status === "shipped") {
      return {
        background: "#cce5ff",
        color: "#004085",
        padding: "6px 10px",
        borderRadius: "6px",
        display: "inline-block",
        fontWeight: "600",
      };
    }

    if (status === "delivered") {
      return {
        background: "#d4edda",
        color: "#155724",
        padding: "6px 10px",
        borderRadius: "6px",
        display: "inline-block",
        fontWeight: "600",
      };
    }

    if (status === "cancelled") {
      return {
        background: "#f8d7da",
        color: "#721c24",
        padding: "6px 10px",
        borderRadius: "6px",
        display: "inline-block",
        fontWeight: "600",
      };
    }

    if (status === "rejected") {
      return {
        background: "#343a40",
        color: "#ffffff",
        padding: "6px 10px",
        borderRadius: "6px",
        display: "inline-block",
        fontWeight: "600",
      };
    }

    return {
      background: "#e2e3e5",
      color: "#383d41",
      padding: "6px 10px",
      borderRadius: "6px",
      display: "inline-block",
      fontWeight: "600",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `NPR ${Number(
      amount || 0
    ).toFixed(2)}`;
  };

  const filteredOrders = orders.filter(
    (order) => {
      const searchText =
        search.toLowerCase().trim();

      const customerName =
        order.customer?.name || "";

      const customerEmail =
        order.customer?.email || "";

      const farmerName =
        order.farmer?.name || "";

      const farmerEmail =
        order.farmer?.email || "";

      const productName =
        order.product?.name || "";

      const deliveryAddress =
        order.delivery_address || "";

      const matchesSearch =
        String(order.id)
          .toLowerCase()
          .includes(searchText) ||
        String(order.customer_id)
          .toLowerCase()
          .includes(searchText) ||
        String(order.farmer_id)
          .toLowerCase()
          .includes(searchText) ||
        String(order.product_id)
          .toLowerCase()
          .includes(searchText) ||
        customerName
          .toLowerCase()
          .includes(searchText) ||
        customerEmail
          .toLowerCase()
          .includes(searchText) ||
        farmerName
          .toLowerCase()
          .includes(searchText) ||
        farmerEmail
          .toLowerCase()
          .includes(searchText) ||
        productName
          .toLowerCase()
          .includes(searchText) ||
        deliveryAddress
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  const totalOrders =
    orders.length;

  const pendingOrders =
    orders.filter(
      (order) =>
        order.status === "pending"
    ).length;

  const confirmedOrders =
    orders.filter(
      (order) =>
        order.status === "confirmed"
    ).length;

  const shippedOrders =
    orders.filter(
      (order) =>
        order.status === "shipped"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status === "delivered"
    ).length;

  const cancelledOrders =
    orders.filter(
      (order) =>
        order.status === "cancelled"
    ).length;

  const rejectedOrders =
    orders.filter(
      (order) =>
        order.status === "rejected"
    ).length;

  const completedSales =
    orders
      .filter(
        (order) =>
          order.status === "delivered"
      )
      .reduce(
        (total, order) =>
          total +
          Number(
            order.total_price || 0
          ),
        0
      );

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
          MAIN
      ===================================================== */}

      <main className="dashboard-container">

        {/* HEADER */}

        <div className="dashboard-header">

          <div>

            <h1>
              Order Management 📦
            </h1>

            <p>
              Monitor all GreenChain
              customer orders.
            </p>

          </div>

        </div>


        {/* ===================================================
            STATISTICS
        =================================================== */}

        <section className="dashboard-section">

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
                🔵 Confirmed
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
                ✅ Delivered
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


            <div className="dashboard-card">

              <h3>
                ⚫ Rejected
              </h3>

              <p className="dashboard-number">
                {rejectedOrders}
              </p>

            </div>


            <div className="dashboard-card">

              <h3>
                💰 Completed Sales
              </h3>

              <p className="dashboard-number">
                NPR{" "}
                {completedSales.toFixed(2)}
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            SEARCH AND FILTER
        =================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              Search & Filter Orders
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
                placeholder="Search order, customer, farmer, product..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                style={{
                  flex: "1",
                  minWidth: "280px",
                  padding: "12px",
                  borderRadius: "8px",
                  border:
                    "1px solid #ccc",
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
                  border:
                    "1px solid #ccc",
                }}
              >

                <option value="all">
                  All Statuses
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="shipped">
                  Shipped
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

                <option value="rejected">
                  Rejected
                </option>

              </select>


              <button
                onClick={loadOrders}
                className="auth-button"
              >
                🔄 Refresh
              </button>

            </div>

          </div>

        </section>


        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <section className="dashboard-section">

            <div className="error-message">
              {error}
            </div>

          </section>
        )}


        {/* ===================================================
            ORDER DETAILS
        =================================================== */}

        {detailsLoading && (
          <section className="dashboard-section">

            <div className="dashboard-card">

              <h2>
                Loading Order Details...
              </h2>

              <p>
                Please wait while the
                order information is loaded.
              </p>

            </div>

          </section>
        )}


        {detailsError && (
          <section className="dashboard-section">

            <div className="error-message">
              {detailsError}
            </div>

          </section>
        )}


        {selectedOrder && (
          <section className="dashboard-section">

            <div className="dashboard-card">

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >

                <div>

                  <h2>
                    Order Details 📋
                  </h2>

                  <p>
                    Complete information
                    for Order #
                    {selectedOrder.id}.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  className="auth-button"
                >
                  ✕ Close
                </button>

              </div>


              {/* ORDER SUMMARY */}

              <div
                style={{
                  marginTop: "20px",
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "15px",
                }}
              >

                <div className="dashboard-card">

                  <h3>
                    🆔 Order ID
                  </h3>

                  <p>
                    #
                    {selectedOrder.id}
                  </p>

                </div>


                <div className="dashboard-card">

                  <h3>
                    📦 Product
                  </h3>

                  <p>
                    {
                      selectedOrder.product
                        ?.name ||
                      "N/A"
                    }
                  </p>

                  <small>
                    Product ID:{" "}
                    {
                      selectedOrder.product_id
                    }
                  </small>

                </div>


                <div className="dashboard-card">

                  <h3>
                    🔢 Quantity
                  </h3>

                  <p>
                    {
                      selectedOrder.quantity
                    }
                  </p>

                </div>


                <div className="dashboard-card">

                  <h3>
                    💰 Total Price
                  </h3>

                  <p>
                    {
                      formatCurrency(
                        selectedOrder.total_price
                      )
                    }
                  </p>

                </div>


                <div className="dashboard-card">

                  <h3>
                    📊 Status
                  </h3>

                  <p>

                    <span
                      style={getStatusStyle(
                        selectedOrder.status
                      )}
                    >
                      {
                        getStatusLabel(
                          selectedOrder.status
                        )
                      }
                    </span>

                  </p>

                </div>


                <div className="dashboard-card">

                  <h3>
                    📅 Created
                  </h3>

                  <p>
                    {
                      formatDate(
                        selectedOrder.created_at
                      )
                    }
                  </p>

                </div>

              </div>


              {/* CUSTOMER INFORMATION */}

              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  borderRadius: "10px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                }}
              >

                <h3>
                  👤 Customer Information
                </h3>

                <p>
                  <strong>
                    Customer ID:
                  </strong>{" "}
                  {
                    selectedOrder.customer
                      ?.id ||
                    selectedOrder.customer_id
                  }
                </p>

                <p>
                  <strong>
                    Name:
                  </strong>{" "}
                  {
                    selectedOrder.customer
                      ?.name ||
                    "N/A"
                  }
                </p>

                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {
                    selectedOrder.customer
                      ?.email ||
                    "N/A"
                  }
                </p>

              </div>


              {/* FARMER INFORMATION */}

              <div
                style={{
                  marginTop: "15px",
                  padding: "18px",
                  borderRadius: "10px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                }}
              >

                <h3>
                  👨‍🌾 Farmer Information
                </h3>

                <p>
                  <strong>
                    Farmer ID:
                  </strong>{" "}
                  {
                    selectedOrder.farmer
                      ?.id ||
                    selectedOrder.farmer_id
                  }
                </p>

                <p>
                  <strong>
                    Name:
                  </strong>{" "}
                  {
                    selectedOrder.farmer
                      ?.name ||
                    "N/A"
                  }
                </p>

                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {
                    selectedOrder.farmer
                      ?.email ||
                    "N/A"
                  }
                </p>

              </div>


              {/* DELIVERY INFORMATION */}

              <div
                style={{
                  marginTop: "15px",
                  padding: "18px",
                  borderRadius: "10px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                }}
              >

                <h3>
                  📍 Delivery Information
                </h3>

                <p>
                  <strong>
                    Delivery Address:
                  </strong>
                </p>

                <p>
                  {
                    selectedOrder.delivery_address ||
                    "Not provided"
                  }
                </p>

              </div>

            </div>

          </section>
        )}


        {/* ===================================================
            ORDERS TABLE
        =================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              Orders (
              {filteredOrders.length}
              )
            </h2>


            {loading ? (

              <p>
                Loading orders...
              </p>

            ) : filteredOrders.length ===
              0 ? (

              <p>
                No orders found.
              </p>

            ) : (

              <div
                style={{
                  overflowX:
                    "auto",
                  marginTop:
                    "20px",
                }}
              >

                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    minWidth:
                      "1200px",
                  }}
                >

                  <thead>

                    <tr>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Order
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Customer
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Farmer
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Product
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Quantity
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Total
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Status
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Delivery Address
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Created
                      </th>

                      <th
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredOrders.map(
                      (order) => (

                        <tr
                          key={
                            order.id
                          }
                        >

                          {/* ORDER */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            <strong>
                              #
                              {
                                order.id
                              }
                            </strong>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#777",
                                marginTop:
                                  "4px",
                              }}
                            >
                              Customer ID:{" "}
                              {
                                order.customer_id
                              }
                            </div>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#777",
                              }}
                            >
                              Farmer ID:{" "}
                              {
                                order.farmer_id
                              }
                            </div>

                          </td>


                          {/* CUSTOMER */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            <strong>
                              {
                                order.customer
                                  ?.name ||
                                "Unknown"
                              }
                            </strong>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#777",
                                marginTop:
                                  "4px",
                              }}
                            >
                              {
                                order.customer
                                  ?.email ||
                                "N/A"
                              }
                            </div>

                          </td>


                          {/* FARMER */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            <strong>
                              {
                                order.farmer
                                  ?.name ||
                                "Unknown"
                              }
                            </strong>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#777",
                                marginTop:
                                  "4px",
                              }}
                            >
                              {
                                order.farmer
                                  ?.email ||
                                "N/A"
                              }
                            </div>

                          </td>


                          {/* PRODUCT */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            <strong>
                              {
                                order.product
                                  ?.name ||
                                "Unknown"
                              }
                            </strong>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#777",
                              }}
                            >
                              Product ID:{" "}
                              {
                                order.product_id
                              }
                            </div>

                          </td>


                          {/* QUANTITY */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >
                            {
                              order.quantity
                            }
                          </td>


                          {/* TOTAL */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            <strong>
                              NPR{" "}
                              {
                                Number(
                                  order.total_price ||
                                    0
                                ).toFixed(
                                  2
                                )
                              }
                            </strong>

                          </td>


                          {/* STATUS */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            <span
                              style={getStatusStyle(
                                order.status
                              )}
                            >
                              {
                                getStatusLabel(
                                  order.status
                                )
                              }
                            </span>

                          </td>


                          {/* DELIVERY ADDRESS */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                              maxWidth:
                                "250px",
                            }}
                          >

                            {
                              order.delivery_address ||
                              "N/A"
                            }

                          </td>


                          {/* CREATED */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                              whiteSpace:
                                "nowrap",
                            }}
                          >

                            {
                              formatDate(
                                order.created_at
                              )
                            }

                          </td>


                          {/* ACTION */}

                          <td
                            style={{
                              padding:
                                "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            <button
                              type="button"
                              onClick={() =>
                                handleViewDetails(
                                  order.id
                                )
                              }
                              className="auth-button"
                            >
                              👁️ View
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

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

export default AdminOrders;