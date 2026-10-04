
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function Profile() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { showNotification } = useNotification();

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const userRole =
      user.role ||
      user.user_role ||
      user.user?.role ||
      "";

    if (userRole !== "customer") {
      navigate("/");
      return;
    }

    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users/profile");

      console.log("Profile data:", response.data);

      setProfile(response.data);

      setName(response.data.name || "");
      setEmail(response.data.email || user?.email || "");
      setPhone(response.data.phone || "");
    } catch (err) {
      console.error("Error loading profile:", err);

      const detail = err.response?.data?.detail;

      if (detail) {
        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load your profile."
        );
      } else {
        setError("Failed to load your profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.put("/users/profile", {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
      });

      console.log("Updated profile:", response.data);

      setProfile(response.data);

      setName(response.data.name || "");
      setEmail(response.data.email || trimmedEmail);
      setPhone(response.data.phone || "");

      const updatedUser = {
        ...user,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
      };

      login(updatedUser);

      showNotification(
        "Profile updated successfully! ✅",
        "success"
      );
    } catch (err) {
      console.error("Error updating profile:", err);

      const detail = err.response?.data?.detail;

      if (detail) {
        setError(
          typeof detail === "string"
            ? detail
            : "Unable to update your profile."
        );
      } else {
        setError("Failed to update your profile.");
      }

      showNotification(
        "Profile update failed. Please try again.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const userRole =
    user.role ||
    user.user_role ||
    user.user?.role ||
    "";

  if (userRole !== "customer") {
    return null;
  }

  const role =
    profile?.role ||
    user.role ||
    "customer";

  return (
    <div className="profile-page">

      <header className="navbar">

        <div className="navbar-container">

          <Link to="/" className="logo">
            🌱 GreenChain
          </Link>

          <nav>
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
          </nav>

        </div>

      </header>

      <main className="profile-container">

        <section className="profile-header">

          <h1>
            👤 My Profile
          </h1>

          <p>
            View and update your GreenChain account information.
          </p>

        </section>

        {loading ? (
          <div className="loading-state">
            <p>
              Loading your profile...
            </p>
          </div>
        ) : (
          <section className="profile-card">

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-group">

                <label htmlFor="profile-name">
                  Name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your name"
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="profile-email">
                  Email
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />

                <small>
                  Make sure your email address is correct.
                </small>

              </div>

              <div className="form-group">

                <label htmlFor="profile-phone">
                  Phone
                </label>

                <input
                  id="profile-phone"
                  type="text"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter your phone number"
                  required
                />

              </div>

              <div className="form-group">

                <label htmlFor="profile-role">
                  Role
                </label>

                <input
                  id="profile-role"
                  type="text"
                  value={
                    role === "customer"
                      ? "Customer"
                      : role
                  }
                  disabled
                />

              </div>

              <div className="profile-actions">

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "💾 Save Changes"}
                </button>

                <Link
                  to="/dashboard"
                  className="secondary-button"
                >
                  ← Back to Dashboard
                </Link>

              </div>

            </form>

          </section>
        )}

      </main>

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

export default Profile;