import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Marketplace from "./pages/Marketplace";
import ProductDetails from "./pages/ProductDetails";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import OrderTracking from "./pages/OrderTracking";

import CustomerDashboard from "./pages/CustomerDashboard";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";

import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerProducts from "./pages/FarmerProducts";
import FarmerOrders from "./pages/FarmerOrders";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminPayments from "./pages/AdminPayments";

import Notification from "./components/Notification";
import ProtectedRoute from "./components/ProtectedRoute";

import { useNotification } from "./context/NotificationContext";

import "./App.css";


/* =========================================================
   HOME PAGE
   ========================================================= */

function Home() {
  return (
    <div className="home-page">

      <header className="navbar">

        <div className="navbar-container">

          <Link to="/" className="logo">
            🌱 GreenChain
          </Link>

          <nav>

            <Link to="/">
              🏠 Home
            </Link>

            <Link to="/marketplace">
              🛍️ Marketplace
            </Link>

            <Link to="/cart">
              🛒 Cart
            </Link>

            <Link to="/wishlist">
              ❤️ Wishlist
            </Link>

            <Link to="/orders">
              📦 My Orders
            </Link>

            <Link to="/dashboard">
              📊 Dashboard
            </Link>

            <Link to="/profile">
              👤 Profile
            </Link>

            <Link to="/login">
              🔐 Login
            </Link>

            <Link to="/register">
              📝 Register
            </Link>

          </nav>

        </div>

      </header>


      <main>

        <section className="hero">

          <div className="hero-content">

            <h1>
              Fresh From Farmers,
              <br />
              Directly To You 🌱
            </h1>

            <p>
              GreenChain connects Nepal's farmers
              directly with customers, helping farmers
              earn better prices while customers get
              fresh agricultural products.
            </p>

            <div className="hero-buttons">

              <Link
                to="/marketplace"
                className="primary-button"
              >
                Explore Marketplace
              </Link>

              <Link
                to="/register"
                className="secondary-button"
              >
                Join GreenChain
              </Link>

            </div>

          </div>

        </section>


        <section className="features">

          <div className="section-title">

            <h2>
              Why GreenChain?
            </h2>

            <p>
              Building a better agricultural
              marketplace for Nepal.
            </p>

          </div>


          <div className="feature-grid">

            <div className="feature-card">

              <div className="feature-icon">
                👨‍🌾
              </div>

              <h3>
                Direct From Farmers
              </h3>

              <p>
                Customers can purchase agricultural
                products directly from local farmers.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                💰
              </div>

              <h3>
                Better Prices
              </h3>

              <p>
                Reduce unnecessary middlemen and help
                farmers receive better prices.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                🌱
              </div>

              <h3>
                Fresh Products
              </h3>

              <p>
                Discover fresh agricultural products
                from Nepalese farmers.
              </p>

            </div>


            <div className="feature-card">

              <div className="feature-icon">
                🚚
              </div>

              <h3>
                Order Tracking
              </h3>

              <p>
                Track your order from placement
                to delivery.
              </p>

            </div>

          </div>

        </section>


        <section className="farmer-section">

          <div className="farmer-content">

            <h2>
              Are You a Farmer? 👨‍🌾
            </h2>

            <p>
              Sell your agricultural products directly
              to customers through GreenChain.
            </p>

            <Link
              to="/register"
              className="primary-button"
            >
              Become a GreenChain Farmer
            </Link>

          </div>

        </section>


        <section className="about-section">

          <div className="about-content">

            <h2>
              About GreenChain
            </h2>

            <p>
              GreenChain is a smart agricultural
              marketplace designed for Nepal.
            </p>

            <p>
              Our goal is to create a transparent
              digital marketplace where farmers can
              reach customers directly and customers
              can purchase fresh agricultural products
              easily.
            </p>

          </div>

        </section>

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


/* =========================================================
   NOTIFICATION
   ========================================================= */

function NotificationDisplay() {

  const {
    notification,
    hideNotification,
  } = useNotification();

  return (
    <Notification
      message={notification.message}
      type={notification.type}
      onClose={hideNotification}
    />
  );
}


/* =========================================================
   APP
   ========================================================= */

function App() {

  return (
    <BrowserRouter>

      <NotificationDisplay />

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/marketplace"
          element={<Marketplace />}
        />

        <Route
          path="/marketplace/product/:productId"
          element={<ProductDetails />}
        />


        {/* =================================================
            CUSTOMER ROUTES
        ================================================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["customer"]}
            />
          }
        >

          <Route
            path="/dashboard"
            element={<CustomerDashboard />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/orders"
            element={<MyOrders />}
          />

          <Route
            path="/orders/:orderId"
            element={<OrderDetails />}
          />

          <Route
            path="/orders/:orderId/tracking"
            element={<OrderTracking />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>


        {/* =================================================
            FARMER ROUTES
        ================================================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["farmer"]}
            />
          }
        >

          <Route
            path="/farmer/dashboard"
            element={<FarmerDashboard />}
          />

          <Route
            path="/farmer/products"
            element={<FarmerProducts />}
          />

          <Route
            path="/farmer/orders"
            element={<FarmerOrders />}
          />

        </Route>


        {/* =================================================
            ADMIN ROUTES
        ================================================= */}

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            />
          }
        >

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/payments"
            element={<AdminPayments />}
          />

        </Route>


        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={<Home />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;