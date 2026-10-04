import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminProducts() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("all");

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [detailsError, setDetailsError] =
    useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/admin/products");

      console.log(
        "Admin products response:",
        response.data
      );

      setProducts(
        response.data?.products || []
      );
    } catch (err) {
      console.error(
        "Admin products error:",
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
          "Unable to load products."
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

  const handleViewDetails = async (productId) => {
    try {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedProduct(null);

      const response =
        await api.get(
          `/admin/products/${productId}`
        );

      console.log(
        "Admin product details:",
        response.data
      );

      setSelectedProduct(response.data);
    } catch (err) {
      console.error(
        "Product details error:",
        err
      );

      if (err.response?.status === 403) {
        setDetailsError(
          "Access denied. Admin permission required."
        );
      } else if (err.response?.data?.detail) {
        setDetailsError(
          err.response.data.detail
        );
      } else {
        setDetailsError(
          "Unable to load product details."
        );
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedProduct(null);
    setDetailsError("");
  };

  const handleAvailabilityChange = async (
    productId,
    currentStatus
  ) => {
    try {
      await api.put(
        `/admin/products/${productId}/availability`,
        null,
        {
          params: {
            is_available: !currentStatus,
          },
        }
      );

      alert(
        "Product availability updated successfully."
      );

      await loadProducts();

      if (
        selectedProduct &&
        selectedProduct.id === productId
      ) {
        setSelectedProduct({
          ...selectedProduct,
          is_available: !currentStatus,
        });
      }
    } catch (err) {
      console.error(
        "Availability update error:",
        err
      );

      if (err.response?.data?.detail) {
        alert(
          err.response.data.detail
        );
      } else {
        alert(
          "Unable to update product availability."
        );
      }
    }
  };

  const handleDelete = async (
    productId,
    productName
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${productName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/admin/products/${productId}`
      );

      alert(
        "Product deleted successfully."
      );

      if (
        selectedProduct &&
        selectedProduct.id === productId
      ) {
        closeDetails();
      }

      await loadProducts();
    } catch (err) {
      console.error(
        "Delete product error:",
        err
      );

      if (err.response?.data?.detail) {
        alert(
          err.response.data.detail
        );
      } else {
        alert(
          "Unable to delete product."
        );
      }
    }
  };

  const filteredProducts =
    products.filter((product) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        product.name
          ?.toLowerCase()
          .includes(searchText) ||
        product.category
          ?.toLowerCase()
          .includes(searchText) ||
        product.location
          ?.toLowerCase()
          .includes(searchText) ||
        product.farmer?.name
          ?.toLowerCase()
          .includes(searchText);

      let matchesAvailability = true;

      if (
        availabilityFilter === "available"
      ) {
        matchesAvailability =
          product.is_available === true;
      }

      if (
        availabilityFilter === "unavailable"
      ) {
        matchesAvailability =
          product.is_available === false;
      }

      return (
        matchesSearch &&
        matchesAvailability
      );
    });

  const availableCount =
    products.filter(
      (product) =>
        product.is_available === true
    ).length;

  const unavailableCount =
    products.filter(
      (product) =>
        product.is_available === false
    ).length;

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Not available";
    }

    const date =
      new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleString();
  };

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}

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

      {/* MAIN */}

      <main className="dashboard-container">

        <div className="dashboard-header">

          <div>
            <h1>
              Product Management 📦
            </h1>

            <p>
              Manage agricultural products
              listed by GreenChain farmers.
            </p>
          </div>

        </div>

        {/* PRODUCT STATISTICS */}

        <section className="dashboard-section">

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h3>
                📦 Total Products
              </h3>

              <p className="dashboard-number">
                {products.length}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                🟢 Available
              </h3>

              <p className="dashboard-number">
                {availableCount}
              </p>

            </div>

            <div className="dashboard-card">

              <h3>
                🔴 Unavailable
              </h3>

              <p className="dashboard-number">
                {unavailableCount}
              </p>

            </div>

          </div>

        </section>

        {/* SEARCH AND FILTER */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              Search & Filter Products
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
                placeholder="Search product, category, location or farmer..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                style={{
                  flex: "1",
                  minWidth: "250px",
                  padding: "10px 12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                }}
              />

              <select
                value={
                  availabilityFilter
                }
                onChange={(event) =>
                  setAvailabilityFilter(
                    event.target.value
                  )
                }
                style={{
                  padding: "10px 12px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius: "8px",
                }}
              >
                <option value="all">
                  All Products
                </option>

                <option value="available">
                  Available
                </option>

                <option value="unavailable">
                  Unavailable
                </option>
              </select>

              <button
                onClick={loadProducts}
                className="auth-button"
              >
                🔄 Refresh
              </button>

            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <section className="dashboard-section">

            <div
              className="dashboard-card"
              style={{
                border:
                  "1px solid #fecaca",
                background:
                  "#fef2f2",
                color:
                  "#991b1b",
              }}
            >
              ❌ {error}
            </div>

          </section>
        )}

        {/* PRODUCT DETAILS */}

        {detailsLoading && (
          <section className="dashboard-section">

            <div className="dashboard-card">

              <h2>
                Loading Product Details...
              </h2>

              <p>
                Please wait while the
                product information is loaded.
              </p>

            </div>

          </section>
        )}

        {detailsError && (
          <section className="dashboard-section">

            <div
              className="dashboard-card"
              style={{
                border:
                  "1px solid #fecaca",
                background:
                  "#fef2f2",
                color:
                  "#991b1b",
              }}
            >
              ❌ {detailsError}
            </div>

          </section>
        )}

        {selectedProduct && (
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
                    Product Details 📋
                  </h2>

                  <p>
                    Complete information
                    about the selected product.
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
                    🆔 Product ID
                  </h3>

                  <p>
                    #{selectedProduct.id}
                  </p>

                </div>

                <div className="dashboard-card">

                  <h3>
                    📦 Product Name
                  </h3>

                  <p>
                    {selectedProduct.name}
                  </p>

                </div>

                <div className="dashboard-card">

                  <h3>
                    🏷️ Category
                  </h3>

                  <p>
                    {selectedProduct.category ||
                      "Not specified"}
                  </p>

                </div>

                <div className="dashboard-card">

                  <h3>
                    💰 Price
                  </h3>

                  <p>
                    NPR{" "}
                    {Number(
                      selectedProduct.price || 0
                    ).toFixed(2)}
                    {" / "}
                    {selectedProduct.unit ||
                      "unit"}
                  </p>

                </div>

                <div className="dashboard-card">

                  <h3>
                    📊 Quantity
                  </h3>

                  <p>
                    {selectedProduct.quantity}{" "}
                    {selectedProduct.unit ||
                      ""}
                  </p>

                </div>

                <div className="dashboard-card">

                  <h3>
                    📍 Location
                  </h3>

                  <p>
                    {selectedProduct.location ||
                      "Not specified"}
                  </p>

                </div>

                <div className="dashboard-card">

                  <h3>
                    🟢 Availability
                  </h3>

                  <p>
                    {selectedProduct.is_available
                      ? "Available"
                      : "Unavailable"}
                  </p>

                </div>

                <div className="dashboard-card">

                  <h3>
                    📅 Created
                  </h3>

                  <p>
                    {formatDate(
                      selectedProduct.created_at
                    )}
                  </p>

                </div>

              </div>

              <div
                style={{
                  marginTop: "20px",
                }}
              >

                <h3>
                  📝 Description
                </h3>

                <p
                  style={{
                    lineHeight: "1.7",
                    color: "#4b5563",
                  }}
                >
                  {selectedProduct.description ||
                    "No description available."}
                </p>

              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "18px",
                  borderRadius: "10px",
                  background: "#f8fafc",
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
                  {selectedProduct.farmer?.id ||
                    "N/A"}
                </p>

                <p>
                  <strong>
                    Name:
                  </strong>{" "}
                  {selectedProduct.farmer?.name ||
                    "N/A"}
                </p>

                <p>
                  <strong>
                    Email:
                  </strong>{" "}
                  {selectedProduct.farmer?.email ||
                    "N/A"}
                </p>

              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    handleAvailabilityChange(
                      selectedProduct.id,
                      selectedProduct.is_available
                    )
                  }
                  className="auth-button"
                >
                  {selectedProduct.is_available
                    ? "🔴 Disable Product"
                    : "🟢 Enable Product"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedProduct.id,
                      selectedProduct.name
                    )
                  }
                  className="auth-button"
                  style={{
                    background:
                      "#dc2626",
                  }}
                >
                  🗑️ Delete Product
                </button>

              </div>

            </div>

          </section>
        )}

        {/* PRODUCTS TABLE */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              Products (
              {filteredProducts.length}
              )
            </h2>

            {loading ? (
              <p>
                Loading products...
              </p>
            ) : filteredProducts.length === 0 ? (
              <p>
                No products found.
              </p>
            ) : (

              <div
                style={{
                  overflowX: "auto",
                  marginTop: "15px",
                }}
              >

                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        Product
                      </th>

                      <th>
                        Category
                      </th>

                      <th>
                        Farmer
                      </th>

                      <th>
                        Price
                      </th>

                      <th>
                        Quantity
                      </th>

                      <th>
                        Location
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredProducts.map(
                      (product) => (

                        <tr
                          key={
                            product.id
                          }
                        >

                          <td>
                            #
                            {product.id}
                          </td>

                          <td>
                            <strong>
                              {product.name}
                            </strong>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#6b7280",
                                marginTop:
                                  "4px",
                              }}
                            >
                              {product.description}
                            </div>
                          </td>

                          <td>
                            {product.category ||
                              "N/A"}
                          </td>

                          <td>
                            <strong>
                              {product.farmer
                                ?.name ||
                                "N/A"}
                            </strong>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#6b7280",
                              }}
                            >
                              ID:{" "}
                              {product.farmer
                                ?.id ||
                                "N/A"}
                            </div>
                          </td>

                          <td>
                            NPR{" "}
                            {Number(
                              product.price ||
                                0
                            ).toFixed(2)}

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#6b7280",
                              }}
                            >
                              /{" "}
                              {product.unit ||
                                "unit"}
                            </div>
                          </td>

                          <td>
                            {product.quantity}{" "}
                            {product.unit ||
                              ""}
                          </td>

                          <td>
                            {product.location ||
                              "N/A"}
                          </td>

                          <td>

                            <span
                              className={
                                product.is_available
                                  ? "status-badge status-delivered"
                                  : "status-badge status-cancelled"
                              }
                            >
                              {product.is_available
                                ? "Available"
                                : "Unavailable"}
                            </span>

                          </td>

                          <td>

                            <div
                              style={{
                                display:
                                  "flex",
                                gap: "8px",
                                flexWrap:
                                  "wrap",
                              }}
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  handleViewDetails(
                                    product.id
                                  )
                                }
                                className="auth-button"
                              >
                                👁️ View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleAvailabilityChange(
                                    product.id,
                                    product.is_available
                                  )
                                }
                                className="auth-button"
                              >
                                {product.is_available
                                  ? "Disable"
                                  : "Enable"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    product.id,
                                    product.name
                                  )
                                }
                                className="auth-button"
                                style={{
                                  background:
                                    "#dc2626",
                                }}
                              >
                                Delete
                              </button>

                            </div>

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

      {/* FOOTER */}

      <footer className="dashboard-footer">

        <p>
          🌱 GreenChain Admin Panel
          — Smart Agricultural
          Marketplace for Nepal
        </p>

        <p>
          Product Management
        </p>

      </footer>

    </div>
  );
}

export default AdminProducts;