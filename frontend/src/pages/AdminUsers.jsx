import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminUsers() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      console.log(
        "Admin users response:",
        response.data
      );

      const userList = Array.isArray(
        response.data?.users
      )
        ? response.data.users
        : [];

      setUsers(userList);

      setTotalUsers(
        Number(
          response.data?.total ||
          userList.length
        )
      );
    } catch (err) {
      console.error(
        "Admin users error:",
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
          "Unable to load users. Please check the backend."
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

  const filteredUsers = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        !searchText ||
        user.name
          ?.toLowerCase()
          .includes(searchText) ||
        user.email
          ?.toLowerCase()
          .includes(searchText) ||
        user.phone
          ?.toLowerCase()
          .includes(searchText);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          user.is_active === true) ||
        (statusFilter === "inactive" &&
          user.is_active === false);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const customerCount = users.filter(
    (user) =>
      user.role === "customer"
  ).length;

  const farmerCount = users.filter(
    (user) =>
      user.role === "farmer"
  ).length;

  const adminCount = users.filter(
    (user) =>
      user.role === "admin"
  ).length;

  const activeCount = users.filter(
    (user) =>
      user.is_active === true
  ).length;

  const inactiveCount = users.filter(
    (user) =>
      user.is_active === false
  ).length;

  const getRoleBadgeClass = (role) => {
    if (role === "admin") {
      return "admin-role";
    }

    if (role === "farmer") {
      return "farmer-role";
    }

    return "customer-role";
  };

  const getRoleLabel = (role) => {
    if (role === "admin") {
      return "Admin";
    }

    if (role === "farmer") {
      return "Farmer";
    }

    return "Customer";
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="dashboard-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

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
              navigate("/marketplace")
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

        <div className="dashboard-header">

          <div>

            <h1>
              User Management 👥
            </h1>

            <p>
              Manage GreenChain customers,
              farmers and administrators.
            </p>

          </div>

          <button
            onClick={loadUsers}
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "🔄 Refresh Users"}
          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <section className="dashboard-section">

            <div className="error-message">
              {error}
            </div>

          </section>

        )}


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="dashboard-section">

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
                🛒 Customers
              </h3>

              <p className="dashboard-number">
                {customerCount}
              </p>

            </div>


            <div className="dashboard-card">

              <h3>
                🌾 Farmers
              </h3>

              <p className="dashboard-number">
                {farmerCount}
              </p>

            </div>


            <div className="dashboard-card">

              <h3>
                🛡️ Admins
              </h3>

              <p className="dashboard-number">
                {adminCount}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            STATUS SUMMARY
        ================================================= */}

        <section className="dashboard-section">

          <div className="dashboard-grid">

            <div className="dashboard-card">

              <h3>
                🟢 Active Users
              </h3>

              <p className="dashboard-number">
                {activeCount}
              </p>

            </div>


            <div className="dashboard-card">

              <h3>
                🔴 Inactive Users
              </h3>

              <p className="dashboard-number">
                {inactiveCount}
              </p>

            </div>


            <div className="dashboard-card">

              <h3>
                🔍 Filtered Users
              </h3>

              <p className="dashboard-number">
                {filteredUsers.length}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            SEARCH AND FILTER
        ================================================= */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              Search & Filter Users
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
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                style={{
                  flex: "1",
                  minWidth: "250px",
                  padding: "12px",
                  borderRadius: "8px",
                  border:
                    "1px solid #ccc",
                }}
              />


              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(
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
                  All Roles
                </option>

                <option value="customer">
                  Customers
                </option>

                <option value="farmer">
                  Farmers
                </option>

                <option value="admin">
                  Admins
                </option>

              </select>


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
                  All Status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

              </select>


              <button
                type="button"
                onClick={clearFilters}
                className="auth-button"
              >
                Clear Filters
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            USERS TABLE
        ================================================= */}

        <section className="dashboard-section">

          <div className="dashboard-card">

            <h2>
              GreenChain Users
            </h2>

            <p>
              Showing{" "}
              <strong>
                {filteredUsers.length}
              </strong>{" "}
              of{" "}
              <strong>
                {totalUsers}
              </strong>{" "}
              users
            </p>


            {loading ? (

              <p>
                Loading GreenChain users...
              </p>

            ) : filteredUsers.length === 0 ? (

              <p>
                No users match your
                search or filters.
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
                    borderCollapse:
                      "collapse",
                  }}
                >

                  <thead>

                    <tr>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        ID
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Name
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Email
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Phone
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Role
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Status
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom:
                            "2px solid #ddd",
                        }}
                      >
                        Created
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredUsers.map(
                      (user) => (

                        <tr
                          key={user.id}
                        >

                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >
                            #{user.id}
                          </td>


                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #eee",
                              fontWeight:
                                "600",
                            }}
                          >
                            {user.name ||
                              "N/A"}
                          </td>


                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >
                            {user.email ||
                              "N/A"}
                          </td>


                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >
                            {user.phone ||
                              "N/A"}
                          </td>


                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            <span
                              className={
                                getRoleBadgeClass(
                                  user.role
                                )
                              }
                            >
                              {getRoleLabel(
                                user.role
                              )}
                            </span>

                          </td>


                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            {user.is_active ? (

                              <span>
                                🟢 Active
                              </span>

                            ) : (

                              <span>
                                🔴 Inactive
                              </span>

                            )}

                          </td>


                          <td
                            style={{
                              padding: "12px",
                              borderBottom:
                                "1px solid #eee",
                            }}
                          >

                            {user.created_at
                              ? new Date(
                                  user.created_at
                                ).toLocaleDateString()
                              : "N/A"}

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

export default AdminUsers;