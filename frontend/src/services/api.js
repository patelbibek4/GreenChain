import axios from "axios";

/* =========================================================
   GREENCHAIN API
   ========================================================= */

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8001",
  timeout: 15000,
});

/* =========================================================
   REQUEST INTERCEPTOR
   Automatically attach JWT token
   ========================================================= */

api.interceptors.request.use(
  (config) => {
    let accessToken =
      localStorage.getItem("access_token");

    /* =====================================================
       FALLBACK TO USER OBJECT
       ===================================================== */

    if (!accessToken) {
      const savedUser =
        localStorage.getItem("user");

      if (savedUser) {
        try {
          const userData =
            JSON.parse(savedUser);

          accessToken =
            userData?.access_token || "";
        } catch (error) {
          console.error(
            "Error reading saved user:",
            error
          );
        }
      }
    }

    /* =====================================================
       ATTACH AUTHORIZATION HEADER
       ===================================================== */

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

api.interceptors.response.use(
  /* ================= SUCCESS ================= */

  (response) => {
    return response;
  },

  /* ================= ERROR ================= */

  (error) => {
    /* =====================================================
       BACKEND NOT REACHABLE
       ===================================================== */

    if (!error.response) {
      console.error(
        "GreenChain API is unreachable. " +
        "Please make sure the backend is running."
      );

      return Promise.reject(error);
    }

    const status =
      error.response.status;

    /* =====================================================
       401 — UNAUTHORIZED
       ===================================================== */

    if (status === 401) {
      console.warn(
        "Authentication required or session expired."
      );

      const currentPath =
        window.location.pathname;

      if (
        currentPath !== "/login" &&
        currentPath !== "/register"
      ) {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");

        window.location.href = "/login";
      }
    }

    /* =====================================================
       403 — FORBIDDEN
       ===================================================== */

    if (status === 403) {
      console.warn(
        "Access denied. " +
        "You do not have permission for this action."
      );
    }

    /* =====================================================
       404 — NOT FOUND
       ===================================================== */

    if (status === 404) {
      console.warn(
        "Requested GreenChain resource " +
        "was not found."
      );
    }

    /* =====================================================
       422 — VALIDATION ERROR
       ===================================================== */

    if (status === 422) {
      console.warn(
        "GreenChain API validation error.",
        error.response.data
      );
    }

    /* =====================================================
       500+ — SERVER ERROR
       ===================================================== */

    if (status >= 500) {
      console.error(
        "GreenChain server error. " +
        "Please check the backend."
      );
    }

    return Promise.reject(error);
  }
);

export default api;