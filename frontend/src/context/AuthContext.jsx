import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /* =========================================================
     LOAD SAVED USER
     ========================================================= */

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error(
          "Invalid saved user:",
          error
        );

        localStorage.removeItem("user");
        localStorage.removeItem("access_token");

        return null;
      }
    }

    return null;
  });

  /* =========================================================
     LOGIN
     ========================================================= */

  const login = (userData) => {
    console.log(
      "AuthContext login:",
      userData
    );

    // Keep existing token when updating user
    // profile information later.
    const existingToken =
      localStorage.getItem("access_token");

    const accessToken =
      userData?.access_token ||
      existingToken ||
      "";

    const updatedUser = {
      ...userData,

      ...(accessToken
        ? {
            access_token: accessToken,
          }
        : {}),
    };

    // Save complete user object
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    // Save JWT token separately
    if (accessToken) {
      localStorage.setItem(
        "access_token",
        accessToken
      );
    }

    setUser(updatedUser);
  };

  /* =========================================================
     LOGOUT
     ========================================================= */

  const logout = () => {
    localStorage.removeItem("user");

    localStorage.removeItem(
      "access_token"
    );

    setUser(null);
  };

  /* =========================================================
     AUTH PROVIDER
     ========================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   USE AUTH
   ========================================================= */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}