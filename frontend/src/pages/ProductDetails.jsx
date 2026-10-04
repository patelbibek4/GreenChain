import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProductReviews from "../components/ProductReviews";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [removingFromWishlist, setRemovingFromWishlist] =
    useState(false);

  const [isWishlisted, setIsWishlisted] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [quantity, setQuantity] = useState(1);

  // =========================================================
  // BACKEND URL
  // =========================================================

  const BACKEND_URL = 
     import.meta.env.VITE_API_URL ||
     "http://127.0.0.1:8001";

  // =========================================================
  // LOAD PRODUCT
  // =========================================================

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data);
      } catch (err) {
        console.error("Error loading product:", err);

        if (err.response?.data?.detail) {
          setError(err.response.data.detail);
        } else {
          setError(
            "Unable to load product. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // =========================================================
  // CHECK WISHLIST
  // =========================================================

  useEffect(() => {
    const checkWishlist = async () => {
      if (!isLoggedIn || user?.role !== "customer") {
        setIsWishlisted(false);
        return;
      }

      try {
        const response = await api.get("/wishlist/");

        const wishlistData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.items)
          ? response.data.items
          : [];

        const productExists = wishlistData.some((item) => {
          const id =
            item.product_id ??
            item.product?.id ??
            item.id;

          return Number(id) === Number(productId);
        });

        setIsWishlisted(productExists);
      } catch (err) {
        console.error(
          "Error checking wishlist:",
          err
        );

        setIsWishlisted(false);
      }
    };

    checkWishlist();
  }, [productId, isLoggedIn, user]);

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = async () => {
    setError("");
    setSuccess("");

    if (!isLoggedIn) {
      alert(
        "Please login before adding products to your cart."
      );

      navigate("/login");
      return;
    }

    if (user?.role !== "customer") {
      setError(
        "Only customer accounts can add products to the cart."
      );

      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    if (
      product?.quantity !== undefined &&
      quantity > product.quantity
    ) {
      setError(
        `Only ${product.quantity} units are available.`
      );

      return;
    }

    setAddingToCart(true);

    try {
      await api.post("/cart/", {
        product_id: Number(productId),
        quantity: quantity,
      });

      setSuccess(
        "Product added to your cart successfully! 🛒"
      );
    } catch (err) {
      console.error(
        "Error adding product to cart:",
        err
      );

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to add product to cart. Please try again."
        );
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // =========================================================
  // ADD TO WISHLIST
  // =========================================================

  const handleAddToWishlist = async () => {
    setError("");
    setSuccess("");

    if (!isLoggedIn) {
      alert(
        "Please login before adding products to your wishlist."
      );

      navigate("/login");
      return;
    }

    if (user?.role !== "customer") {
      setError(
        "Only customer accounts can use the wishlist."
      );

      return;
    }

    setAddingToWishlist(true);

    try {
      await api.post(`/wishlist/${productId}`);

      setIsWishlisted(true);

      setSuccess(
        "Product added to your wishlist! ❤️"
      );
    } catch (err) {
      console.error(
        "Error adding product to wishlist:",
        err
      );

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to add product to your wishlist. Please try again."
        );
      }
    } finally {
      setAddingToWishlist(false);
    }
  };

  // =========================================================
  // REMOVE FROM WISHLIST
  // =========================================================

  const handleRemoveFromWishlist = async () => {
    setError("");
    setSuccess("");

    setRemovingFromWishlist(true);

    try {
      await api.delete(`/wishlist/${productId}`);

      setIsWishlisted(false);

      setSuccess(
        "Product removed from your wishlist. 💔"
      );
    } catch (err) {
      console.error(
        "Error removing product from wishlist:",
        err
      );

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to remove product from your wishlist. Please try again."
        );
      }
    } finally {
      setRemovingFromWishlist(false);
    }
  };

  // =========================================================
  // PRODUCT IMAGE URL
  // =========================================================

  const productImageUrl = product?.image_url
    ? product.image_url.startsWith("http")
      ? product.image_url
      : `${BACKEND_URL}${product.image_url}`
    : null;

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="marketplace-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="navbar">

        <div className="navbar-container">

          <Link to="/" className="logo">
            🌱 GreenChain
          </Link>

          <div className="nav-links">

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

            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>

          </div>

        </div>

      </nav>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="marketplace-header">

        <div className="container">

          <h1>
            🌱 Product Details
          </h1>

          <p>
            View complete information about this
            agricultural product.
          </p>

        </div>

      </section>

      {/* =====================================================
          PRODUCT DETAILS
      ===================================================== */}

      <section className="marketplace-products">

        <div className="container">

          {loading && (
            <p className="loading-message">
              Loading product...
            </p>
          )}

          {error && (
            <div>

              <p className="error-message">
                {error}
              </p>

              {!product && (
                <Link to="/marketplace">
                  ← Back to Marketplace
                </Link>
              )}

            </div>
          )}

          {!loading && product && (

            <div className="product-details-card">

              {/* =================================================
                  PRODUCT IMAGE
              ================================================= */}

              <div className="product-details-image">

                {productImageUrl ? (
                  <img
                    src={productImageUrl}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      fontSize: "80px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    🌱
                  </div>
                )}

              </div>

              {/* =================================================
                  PRODUCT INFORMATION
              ================================================= */}

              <div className="product-details-content">

                <h2>
                  {product.name}
                </h2>

                <p className="product-description">
                  {product.description ||
                    "Fresh agricultural product from a local farmer."}
                </p>

                {/* Success Message */}

                {success && (
                  <p className="success-message">
                    {success}
                  </p>
                )}

                {/* Product Information */}

                <div className="product-details-info">

                  <p>
                    <strong>Category:</strong>{" "}
                    {product.category ||
                      "Agricultural Product"}
                  </p>

                  <p>
                    <strong>Price:</strong>{" "}
                    Rs. {product.price}
                  </p>

                  <p>
                    <strong>Unit:</strong>{" "}
                    {product.unit || "unit"}
                  </p>

                  <p>
                    <strong>Available Quantity:</strong>{" "}
                    {product.quantity}
                  </p>

                  <p>
                    <strong>Location:</strong>{" "}
                    📍 {product.location || "Nepal"}
                  </p>

                  <p>
                    <strong>Farmer ID:</strong>{" "}
                    {product.farmer_id || "N/A"}
                  </p>

                </div>

                {/* =================================================
                    QUANTITY
                ================================================= */}

                <div className="quantity-section">

                  <label htmlFor="quantity">
                    <strong>
                      Quantity:
                    </strong>
                  </label>

                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        Number(event.target.value)
                      )
                    }
                  />

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="product-details-actions">

                  {/* Cart */}

                  <button
                    className="auth-button"
                    onClick={handleAddToCart}
                    disabled={
                      addingToCart ||
                      product.quantity <= 0
                    }
                  >
                    {addingToCart
                      ? "Adding..."
                      : product.quantity <= 0
                      ? "Out of Stock"
                      : "🛒 Add to Cart"}
                  </button>

                  {/* Wishlist */}

                  {!isWishlisted ? (

                    <button
                      type="button"
                      className="wishlist-button"
                      onClick={handleAddToWishlist}
                      disabled={addingToWishlist}
                    >
                      {addingToWishlist
                        ? "Adding..."
                        : "❤️ Add to Wishlist"}
                    </button>

                  ) : (

                    <button
                      type="button"
                      className="remove-wishlist-button"
                      onClick={
                        handleRemoveFromWishlist
                      }
                      disabled={
                        removingFromWishlist
                      }
                    >
                      {removingFromWishlist
                        ? "Removing..."
                        : "💔 Remove from Wishlist"}
                    </button>

                  )}

                  <Link
                    to="/marketplace"
                    className="back-marketplace-link"
                  >
                    ← Back to Marketplace
                  </Link>

                </div>

              </div>

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          CUSTOMER REVIEWS
      ===================================================== */}

      {!loading && product && (
        <ProductReviews
          productId={productId}
        />
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="footer">

        <div className="container">

          <h3>
            🌱 GreenChain
          </h3>

          <p>
            Smart Agricultural Marketplace for Nepal
          </p>

          <p>
            © 2026 GreenChain. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default ProductDetails;