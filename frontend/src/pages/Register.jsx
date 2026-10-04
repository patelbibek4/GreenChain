import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

function Register() {
  const navigate = useNavigate();

  const { showNotification } = useNotification();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/users/", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
        role: "customer",
      });

      console.log(
        "Registration successful:",
        response.data
      );

      showNotification(
        "Account created successfully.",
        "success"
      );

      navigate("/login");
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (!err.response) {
        setError(
          "Cannot connect to GreenChain API. Please make sure the backend is running."
        );
      } else {
        setError(
          "Registration failed. Please check your information and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gc-simple-register-page">

      <main className="gc-simple-register-container">

        {/* BRAND */}

        <div className="gc-simple-register-brand">

          <div className="gc-simple-logo">
            <span className="gc-simple-logo-mark">
              G
            </span>

            <span>
              reenChain
            </span>
          </div>

          <p>
            Smart Agricultural Marketplace
          </p>

        </div>

        {/* REGISTER CARD */}

        <section className="gc-simple-register-card">

          <h1>
            Create new account
          </h1>

          <p className="gc-simple-register-subtitle">
            Join GreenChain today.
          </p>

          <form
            onSubmit={handleRegister}
            className="gc-simple-register-form"
          >

            {/* NAME */}

            <div className="gc-simple-field">

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                autoComplete="name"
                required
              />

            </div>

            {/* EMAIL */}

            <div className="gc-simple-field">

              <label htmlFor="email">
                Email Address
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

            {/* PHONE */}

            <div className="gc-simple-field">

              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                autoComplete="tel"
                required
              />

            </div>

            {/* PASSWORD */}

            <div className="gc-simple-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="gc-simple-password">

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="gc-simple-password-toggle"
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
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
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
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
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

              <small>
                Use at least 8 characters.
              </small>

            </div>

            {/* ERROR */}

            {error && (
              <div className="gc-simple-register-error">
                {error}
              </div>
            )}

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              className="gc-simple-register-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          {/* DIVIDER */}

          <div className="gc-simple-register-divider">
            <span></span>
            <strong>OR</strong>
            <span></span>
          </div>

          {/* SIGN IN */}

          <div className="gc-simple-signin">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>

        </section>

        {/* BACK */}

        <Link
          to="/"
          className="gc-simple-register-back"
        >
          ← Back to GreenChain
        </Link>

        {/* FOOTER */}

        <footer className="gc-simple-register-footer">
          GreenChain
        </footer>

      </main>

    </div>
  );
}

export default Register;