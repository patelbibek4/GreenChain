import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/login", {
        email: email.trim(),
        password: password,
      });

      const data = response.data;

      const role =
        data.role ||
        data.user_role ||
        data.user?.role ||
        "";

      const accessToken =
        data.access_token ||
        data.token ||
        data.user?.access_token ||
        "";

      const userData = {
        ...data,
        role: role,
        access_token: accessToken,
      };

      if (!userData.access_token) {
        throw new Error(
          "Login succeeded, but no access token was returned."
        );
      }

      if (!userData.role) {
        throw new Error(
          "Login succeeded, but no user role was returned."
        );
      }

      login(userData);

      showNotification(
        "Login successful. Welcome to GreenChain.",
        "success"
      );

      if (userData.role === "admin") {
        navigate("/admin/dashboard");
      } else if (userData.role === "farmer") {
        navigate("/farmer/dashboard");
      } else if (userData.role === "customer") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(
          "Login failed. Please check your email and password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gc-login-page">

      <main className="gc-login-container">

        {/* BRAND */}

        <section className="gc-login-brand">

          <div className="gc-logo">
            <span className="gc-logo-leaf">G</span>
            <span className="gc-logo-text">reenChain</span>
          </div>

          <p>
            Smart Agricultural Marketplace
          </p>

        </section>

        {/* LOGIN CARD */}

        <section className="gc-login-card">

          <h1>
            Welcome back
          </h1>

          <p className="gc-login-description">
            Sign in to continue to GreenChain.
          </p>

          <form
            onSubmit={handleLogin}
            className="gc-login-form"
          >

            {/* EMAIL */}

            <div className="gc-login-field">

              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
                required
              />

            </div>

            {/* PASSWORD */}

            <div className="gc-login-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="gc-password-wrapper">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="gc-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M3 3l18 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <path
                        d="M10.6 10.6a2 2 0 002.8 2.8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <path
                        d="M2 12c1.5-4.2 5.2-7 10-7 4.8 0 8.5 2.8 10 7-1.5 4.2-5.2 7-10 7-4.8 0-8.5-2.8-10-7z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path
                        d="M2 12c1.5-4.2 5.2-7 10-7 4.8 0 8.5 2.8 10 7-1.5 4.2-5.2 7-10 7-4.8 0-8.5-2.8-10-7z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="gc-login-error">
                {error}
              </div>
            )}

            {/* SIGN IN */}

            <button
              type="submit"
              className="gc-login-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

          {/* FORGOT PASSWORD */}

          <button
            type="button"
            className="gc-forgot-password"
            onClick={() =>
              alert(
                "Password recovery will be available soon."
              )
            }
          >
            Forgot password?
          </button>

          {/* DIVIDER */}

          <div className="gc-login-divider">
            <span></span>
            <strong>OR</strong>
            <span></span>
          </div>

          {/* CREATE ACCOUNT */}

          <Link
            to="/register"
            className="gc-create-account"
          >
            Create new account
          </Link>

        </section>

        {/* BACK */}

        <Link
          to="/"
          className="gc-back-home"
        >
          ← Back to GreenChain
        </Link>

        {/* FOOTER */}

        <footer className="gc-login-footer">

          <span>
            GreenChain
          </span>

          <span>•</span>

          <span>
            Connecting farmers and consumers across Nepal
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Login;