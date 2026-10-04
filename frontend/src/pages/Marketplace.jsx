import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const API_BASE_URL = 
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8001";

function Marketplace() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // IMAGE URL HELPER
  // =========================================================

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return null;
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    return `${API_BASE_URL}${imageUrl}`;
  };

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (category.trim()) {
        params.category = category.trim();
      }

      if (location.trim()) {
        params.location = location.trim();
      }

      if (minPrice !== "") {
        params.min_price = Number(minPrice);
      }

      if (maxPrice !== "") {
        params.max_price = Number(maxPrice);
      }

      const response = await api.get("/products/", {
        params,
      });

      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (Array.isArray(response.data?.items)) {
        setProducts(response.data.items);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(
        "Error loading marketplace products:",
        err
      );

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to load products. Please try again."
        );
      }

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL PRODUCTS
  // =========================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (event) => {
    event.preventDefault();
    fetchProducts();
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");

    setTimeout(() => {
      fetchProducts();
    }, 0);
  };

  // =========================================================
  // IMAGE ERROR HANDLER
  // =========================================================

  const handleImageError = (event) => {
    event.currentTarget.style.display = "none";

    const fallback =
      event.currentTarget.parentElement.querySelector(
        ".image-fallback"
      );

    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  return (
    <div className="marketplace-page">

      {/* =====================================================
          NAVBAR
      ====================================================== */}

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
      ====================================================== */}

      <section className="marketplace-header">

        <div className="container">

          <h1>
            🌱 GreenChain Marketplace
          </h1>

          <p>
            Buy fresh agricultural products directly
            from local farmers in Nepal.
          </p>

        </div>

      </section>

      {/* =====================================================
          SEARCH AND FILTERS
      ====================================================== */}

      <section className="marketplace-filters">

        <div className="container">

          <div className="filter-card">

            <h2>
              🔎 Find Agricultural Products
            </h2>

            <form
              onSubmit={handleSearch}
              className="filter-form"
            >

              {/* Search */}

              <div className="filter-group">

                <label htmlFor="search">
                  Product Search
                </label>

                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search potatoes, tomato, cucumber..."
                />

              </div>

              {/* Category */}

              <div className="filter-group">

                <label htmlFor="category">
                  Category
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >

                  <option value="">
                    All Categories
                  </option>

                  <option value="Vegetables">
                    Vegetables
                  </option>

                  <option value="Fruits">
                    Fruits
                  </option>

                  <option value="Grains">
                    Grains
                  </option>

                  <option value="Pulses">
                    Pulses
                  </option>

                  <option value="Spices">
                    Spices
                  </option>

                  <option value="Dairy">
                    Dairy
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* Location */}

              <div className="filter-group">

                <label htmlFor="location">
                  Location
                </label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="Birgunj, Chitwan..."
                />

              </div>

              {/* Minimum Price */}

              <div className="filter-group">

                <label htmlFor="minPrice">
                  Minimum Price
                </label>

                <input
                  id="minPrice"
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(event.target.value)
                  }
                  placeholder="Rs. 0"
                />

              </div>

              {/* Maximum Price */}

              <div className="filter-group">

                <label htmlFor="maxPrice">
                  Maximum Price
                </label>

                <input
                  id="maxPrice"
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(event.target.value)
                  }
                  placeholder="Rs. 1000"
                />

              </div>

              {/* Buttons */}

              <div className="filter-actions">

                <button
                  type="submit"
                  className="primary-button"
                >
                  🔎 Search Products
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleClearFilters}
                >
                  🔄 Clear Filters
                </button>

              </div>

            </form>

          </div>

        </div>

      </section>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      <section className="marketplace-products">

        <div className="container">

          <div className="marketplace-products-header">

            <div>

              <h2>
                🛒 Available Products
              </h2>

              {!loading && (
                <p>
                  {products.length}{" "}
                  {products.length === 1
                    ? "product"
                    : "products"}{" "}
                  found
                </p>
              )}

            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Loading */}

          {loading && (
            <div className="loading-message">

              <p>
                Loading products...
              </p>

            </div>
          )}

          {/* Empty */}

          {!loading &&
            !error &&
            products.length === 0 && (

              <div className="empty-products">

                <div className="empty-review-icon">
                  🌱
                </div>

                <h3>
                  No Products Found
                </h3>

                <p>
                  Try changing your search or
                  filter options.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleClearFilters}
                >
                  🔄 Show All Products
                </button>

              </div>
            )}

          {/* =================================================
              PRODUCT GRID
          ================================================== */}

          {!loading &&
            products.length > 0 && (

              <div className="marketplace-grid">

                {products.map((product) => {

                  const imageUrl = getImageUrl(
                    product.image_url
                  );

                  return (
                    <article
                      className="product-card"
                      key={product.id}
                    >

                      {/* ======================================
                          PRODUCT IMAGE
                      ======================================= */}

                      <div className="product-image">

                        {/* Fallback */}

                        <div
                          className="image-fallback"
                          style={{
                            display: imageUrl
                              ? "none"
                              : "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                            fontSize: "48px",
                          }}
                        >
                          🌱
                        </div>

                        {/* Real image */}

                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            onError={handleImageError}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                        )}

                      </div>

                      {/* ======================================
                          PRODUCT CONTENT
                      ======================================= */}

                      <div className="product-content">

                        <h3>
                          {product.name}
                        </h3>

                        <p className="product-description">
                          {product.description ||
                            "Fresh agricultural product from a local farmer."}
                        </p>

                        <div className="product-info">

                          <p>
                            <strong>
                              Category:
                            </strong>{" "}
                            {product.category ||
                              "Agricultural Product"}
                          </p>

                          <p>
                            <strong>
                              Price:
                            </strong>{" "}

                            <span className="product-price">
                              Rs. {product.price}
                            </span>

                            {product.unit && (
                              <span>
                                {" "}
                                / {product.unit}
                              </span>
                            )}

                          </p>

                          <p>
                            <strong>
                              Available:
                            </strong>{" "}

                            {product.quantity}{" "}
                            {product.unit || "units"}
                          </p>

                          <p>
                            <strong>
                              Location:
                            </strong>{" "}

                            📍{" "}

                            {product.location ||
                              "Nepal"}
                          </p>

                        </div>

                        {/* Availability */}

                        <div className="product-availability">

                          {product.is_available !==
                            false &&
                          Number(product.quantity) >
                            0 ? (

                            <span>
                              🟢 Available
                            </span>

                          ) : (

                            <span>
                              🔴 Out of Stock
                            </span>

                          )}

                        </div>

                        {/* View Product */}

                        <Link
                          to={`/marketplace/product/${product.id}`}
                          className="view-product-button"
                        >
                          View Product →
                        </Link>

                      </div>

                    </article>
                  );
                })}

              </div>
            )}

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

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

export default Marketplace;