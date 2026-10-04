import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useNotification,
} from "../context/NotificationContext";


const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8001";


const initialFormData = {
  name: "",
  description: "",
  category: "",
  price: "",
  quantity: "",
  unit: "kg",
  location: "",
};


function FarmerProducts() {
  const navigate = useNavigate();

  const {
    user,
    isLoggedIn,
  } = useAuth();

  const {
    showNotification,
  } = useNotification();


  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingProductId, setEditingProductId] =
    useState(null);

  const [formData, setFormData] =
    useState(initialFormData);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [uploadingImageId, setUploadingImageId] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);


  /*
   * =========================================================
   * AUTHENTICATION
   * =========================================================
   */

  useEffect(() => {
    if (!isLoggedIn || !user) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    const userRole =
      user.role ||
      user.user_role ||
      user.user?.role ||
      "";

    if (userRole !== "farmer") {
      navigate("/", {
        replace: true,
      });

      return;
    }

    loadProducts();
  }, [
    isLoggedIn,
    user,
    navigate,
  ]);


  /*
   * =========================================================
   * LOAD PRODUCTS
   * =========================================================
   */

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/farmer/products/"
        );

      console.log(
        "Farmer products:",
        response.data
      );

      const data =
        response.data;

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (
        Array.isArray(data?.items)
      ) {
        setProducts(data.items);
      } else if (
        Array.isArray(data?.products)
      ) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }

    } catch (err) {
      console.error(
        "Error loading products:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "You do not have permission to manage farmer products."
        );
      } else if (
        err.response?.data?.detail
      ) {
        const detail =
          err.response.data.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Failed to load your products."
        );
      } else {
        setError(
          "Failed to load your products."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  /*
   * =========================================================
   * FORM CHANGE
   * =========================================================
   */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };


  /*
   * =========================================================
   * IMAGE CHANGE
   * =========================================================
   */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      setError(
        "Invalid image type. Only JPG, PNG and WEBP are allowed."
      );

      showNotification(
        "Invalid image type. Use JPG, PNG or WEBP.",
        "error"
      );

      event.target.value = "";

      setSelectedImage(null);
      setImagePreview(null);

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be 5 MB or smaller."
      );

      showNotification(
        "Image must be 5 MB or smaller.",
        "error"
      );

      event.target.value = "";

      setSelectedImage(null);
      setImagePreview(null);

      return;
    }

    setError("");

    setSelectedImage(file);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };


  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   */

  const resetForm = () => {
    setFormData(
      initialFormData
    );

    setEditingProductId(null);

    setShowForm(false);

    setSelectedImage(null);

    setImagePreview(null);

    setError("");
  };


  /*
   * =========================================================
   * OPEN ADD FORM
   * =========================================================
   */

  const openAddForm = () => {
    setFormData(
      initialFormData
    );

    setEditingProductId(null);

    setSelectedImage(null);

    setImagePreview(null);

    setShowForm(true);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /*
   * =========================================================
   * ADD PRODUCT
   * =========================================================
   */

  const handleAddProduct = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const productName =
      formData.name.trim();

    const description =
      formData.description.trim();

    const category =
      formData.category.trim();

    const location =
      formData.location.trim();

    const price =
      Number(formData.price);

    const quantity =
      Number(formData.quantity);


    if (!productName) {
      setError(
        "Product name is required."
      );
      return;
    }

    if (!category) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (!location) {
      setError(
        "Product location is required."
      );
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError(
        "Price must be greater than 0."
      );
      return;
    }

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Quantity must be greater than 0."
      );
      return;
    }


    try {
      setSaving(true);

      const response =
        await api.post(
          "/farmer/products/",
          {
            name: productName,
            description,
            category,
            price,
            quantity,
            unit: formData.unit,
            location,
          }
        );

      console.log(
        "Created product:",
        response.data
      );

      const newProduct =
        response.data;

      const newProductId =
        newProduct?.id ??
        newProduct?.product_id;


      /*
       * Upload image after product creation.
       */

      if (
        selectedImage &&
        newProductId
      ) {
        try {
          await uploadProductImage(
            newProductId,
            selectedImage
          );
        } catch (imageError) {
          console.error(
            "Product image upload failed:",
            imageError
          );

          showNotification(
            "Product was added, but the image upload failed.",
            "warning"
          );
        }
      }


      resetForm();

      await loadProducts();

      showNotification(
        "Product added successfully! 🌱",
        "success"
      );

    } catch (err) {
      console.error(
        "Error adding product:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (detail) {
        setError(
          typeof detail === "string"
            ? detail
            : "Failed to add product."
        );
      } else {
        setError(
          "Failed to add product."
        );
      }

      showNotification(
        "Failed to add product.",
        "error"
      );

    } finally {
      setSaving(false);
    }
  };


  /*
   * =========================================================
   * EDIT PRODUCT
   * =========================================================
   */

  const handleEditClick = (
    product
  ) => {
    const productId =
      product?.id ??
      product?.product_id;

    if (!productId) {
      setError(
        "Product ID not found."
      );
      return;
    }

    setEditingProductId(
      productId
    );

    setFormData({
      name:
        product.name || "",

      description:
        product.description || "",

      category:
        product.category || "",

      price:
        product.price ?? "",

      quantity:
        product.quantity ?? "",

      unit:
        product.unit || "kg",

      location:
        product.location || "",
    });

    setSelectedImage(null);

    setImagePreview(
      getProductImageUrl(
        product
      )
    );

    setShowForm(true);

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  /*
   * =========================================================
   * UPDATE PRODUCT
   * =========================================================
   */

  const handleUpdateProduct =
    async (event) => {
      event.preventDefault();

      setError("");

      if (!editingProductId) {
        setError(
          "Product ID not found."
        );
        return;
      }

      const productName =
        formData.name.trim();

      const description =
        formData.description.trim();

      const category =
        formData.category.trim();

      const location =
        formData.location.trim();

      const price =
        Number(formData.price);

      const quantity =
        Number(formData.quantity);


      if (!productName) {
        setError(
          "Product name is required."
        );
        return;
      }

      if (!category) {
        setError(
          "Please select a category."
        );
        return;
      }

      if (!location) {
        setError(
          "Product location is required."
        );
        return;
      }

      if (!Number.isFinite(price) || price <= 0) {
        setError(
          "Price must be greater than 0."
        );
        return;
      }

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        setError(
          "Quantity must be greater than 0."
        );
        return;
      }


      try {
        setSaving(true);

        const response =
          await api.put(
            `/farmer/products/${editingProductId}`,
            {
              name: productName,
              description,
              category,
              price,
              quantity,
              unit: formData.unit,
              location,
            }
          );

        console.log(
          "Updated product:",
          response.data
        );


        /*
         * Upload replacement image.
         */

        if (selectedImage) {
          try {
            await uploadProductImage(
              editingProductId,
              selectedImage
            );
          } catch (imageError) {
            console.error(
              "Replacement image upload failed:",
              imageError
            );

            showNotification(
              "Product updated, but the new image upload failed.",
              "warning"
            );
          }
        }


        resetForm();

        await loadProducts();

        showNotification(
          "Product updated successfully! ✏️",
          "success"
        );

      } catch (err) {
        console.error(
          "Error updating product:",
          err
        );

        const detail =
          err.response?.data?.detail;

        if (detail) {
          setError(
            typeof detail === "string"
              ? detail
              : "Failed to update product."
          );
        } else {
          setError(
            "Failed to update product."
          );
        }

        showNotification(
          "Failed to update product.",
          "error"
        );

      } finally {
        setSaving(false);
      }
    };


  /*
   * =========================================================
   * UPLOAD PRODUCT IMAGE
   * =========================================================
   */

  const uploadProductImage =
    async (
      productId,
      imageFile
    ) => {
      if (
        !productId ||
        !imageFile
      ) {
        return;
      }

      try {
        setUploadingImageId(
          productId
        );

        const imageFormData =
          new FormData();

        imageFormData.append(
          "image",
          imageFile
        );

        const response =
          await api.post(
            `/farmer/products/${productId}/image`,
            imageFormData
          );

        console.log(
          "Image upload response:",
          response.data
        );

        return response.data;

      } finally {
        setUploadingImageId(
          null
        );
      }
    };


  /*
   * =========================================================
   * DELETE PRODUCT
   * =========================================================
   */

  const handleDelete = async (
    productId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      setDeletingId(
        productId
      );

      await api.delete(
        `/farmer/products/${productId}`
      );

      setProducts(
        (previous) =>
          previous.filter(
            (product) =>
              (
                product.id ??
                product.product_id
              ) !== productId
          )
      );

      showNotification(
        "Product deleted successfully. 🗑️",
        "success"
      );

    } catch (err) {
      console.error(
        "Error deleting product:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (detail) {
        setError(
          typeof detail === "string"
            ? detail
            : "Failed to delete product."
        );
      } else {
        setError(
          "Failed to delete product."
        );
      }

      showNotification(
        "Failed to delete product.",
        "error"
      );

    } finally {
      setDeletingId(null);
    }
  };


  /*
   * =========================================================
   * IMAGE URL
   * =========================================================
   */

  const getProductImageUrl =
    (product) => {
      const imageUrl =
        product?.image_url;

      if (!imageUrl) {
        return null;
      }

      if (
        imageUrl.startsWith(
          "http://"
        ) ||
        imageUrl.startsWith(
          "https://"
        )
      ) {
        return imageUrl;
      }

      return (
        `${BACKEND_URL}${imageUrl}`
      );
    };


  /*
   * =========================================================
   * AUTH GUARD
   * =========================================================
   */

  const userRole =
    user?.role ||
    user?.user_role ||
    user?.user?.role ||
    "";

  if (
    !isLoggedIn ||
    !user ||
    userRole !== "farmer"
  ) {
    return null;
  }


  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <div className="farmer-products-page">

      {/* ================= NAVBAR ================= */}

      <header className="navbar">

        <div className="navbar-container">

          <Link
            to="/"
            className="logo"
          >
            🌱 GreenChain
          </Link>

          <nav className="nav-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/marketplace">
              Marketplace
            </Link>

            <Link to="/farmer/dashboard">
              📊 Dashboard
            </Link>

            <Link to="/farmer/products">
              🌾 My Products
            </Link>

            <Link to="/farmer/orders">
              📦 Orders
            </Link>

          </nav>

        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="farmer-products-container">

        <div className="page-header">

          <div>

            <h1>
              🌾 My Products
            </h1>

            <p>
              Manage your agricultural
              products and sell directly
              to customers.
            </p>

          </div>

          <button
            type="button"
            className="primary-button"
            onClick={
              showForm
                ? resetForm
                : openAddForm
            }
          >
            {showForm
              ? "✕ Close Form"
              : "＋ Add Product"}
          </button>

        </div>


        {/* ================= ERROR ================= */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        {/* ================= FORM ================= */}

        {showForm && (
          <section className="product-form-card">

            <h2>
              {editingProductId
                ? "✏️ Edit Product"
                : "➕ Add New Product"}
            </h2>


            <form
              onSubmit={
                editingProductId
                  ? handleUpdateProduct
                  : handleAddProduct
              }
            >

              {/* NAME */}

              <div className="form-group">

                <label htmlFor="product-name">
                  Product Name
                </label>

                <input
                  id="product-name"
                  type="text"
                  name="name"
                  placeholder="Example: Fresh Tomatoes"
                  value={formData.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={150}
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div className="form-group">

                <label htmlFor="product-description">
                  Description
                </label>

                <textarea
                  id="product-description"
                  name="description"
                  placeholder="Describe your product"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={2000}
                  rows="4"
                />

              </div>


              {/* CATEGORY + PRICE */}

              <div className="form-row">

                <div className="form-group">

                  <label htmlFor="product-category">
                    Category
                  </label>

                  <select
                    id="product-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select category
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


                <div className="form-group">

                  <label htmlFor="product-price">
                    Price (Rs.)
                  </label>

                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    placeholder="100"
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              {/* QUANTITY + UNIT */}

              <div className="form-row">

                <div className="form-group">

                  <label htmlFor="product-quantity">
                    Quantity
                  </label>

                  <input
                    id="product-quantity"
                    type="number"
                    name="quantity"
                    placeholder="50"
                    min="0.01"
                    step="0.01"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />

                </div>


                <div className="form-group">

                  <label htmlFor="product-unit">
                    Unit
                  </label>

                  <select
                    id="product-unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  >

                    <option value="kg">
                      Kilogram (kg)
                    </option>

                    <option value="gram">
                      Gram
                    </option>

                    <option value="piece">
                      Piece
                    </option>

                    <option value="dozen">
                      Dozen
                    </option>

                    <option value="liter">
                      Liter
                    </option>

                  </select>

                </div>

              </div>


              {/* LOCATION */}

              <div className="form-group">

                <label htmlFor="product-location">
                  Location
                </label>

                <input
                  id="product-location"
                  type="text"
                  name="location"
                  placeholder="Birgunj, Parsa, Nepal"
                  value={formData.location}
                  onChange={handleChange}
                  maxLength={200}
                  required
                />

              </div>


              {/* IMAGE */}

              <div className="form-group">

                <label htmlFor="product-image">
                  Product Image
                </label>

                <input
                  id="product-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />

                <small>
                  JPG, PNG or WEBP • Maximum 5 MB
                </small>

                {imagePreview && (
                  <div
                    style={{
                      marginTop: "15px",
                    }}
                  >

                    <img
                      src={imagePreview}
                      alt="Product preview"
                      style={{
                        width: "180px",
                        height: "140px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                      }}
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  </div>
                )}

              </div>


              {/* ACTIONS */}

              <div className="form-actions">

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    saving ||
                    uploadingImageId !== null
                  }
                >

                  {saving
                    ? editingProductId
                      ? "Updating..."
                      : "Adding..."
                    : editingProductId
                      ? "💾 Update Product"
                      : "🌱 Add Product"}

                </button>


                {editingProductId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

          </section>
        )}


        {/* ================= PRODUCTS ================= */}

        <section className="products-section">

          <h2>
            Your Products ({products.length})
          </h2>


          {loading ? (

            <div className="loading-state">

              <p>
                Loading your products...
              </p>

            </div>

          ) : products.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🌱
              </div>

              <h3>
                No products yet
              </h3>

              <p>
                Add your first agricultural
                product to start selling.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={openAddForm}
              >
                ＋ Add Your First Product
              </button>

            </div>

          ) : (

            <div className="farmer-product-grid">

              {products.map((product) => {

                const productId =
                  product?.id ??
                  product?.product_id;

                const imageUrl =
                  getProductImageUrl(
                    product
                  );

                const isDeleting =
                  deletingId ===
                  productId;

                return (
                  <article
                    className="farmer-product-card"
                    key={productId}
                  >

                    {/* IMAGE */}

                    {imageUrl ? (

                      <img
                        src={imageUrl}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          marginBottom: "15px",
                        }}
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <div
                        style={{
                          width: "100%",
                          height: "200px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "60px",
                          background: "#f5f7f6",
                          borderRadius: "10px",
                          marginBottom: "15px",
                        }}
                      >
                        🌱
                      </div>

                    )}


                    {/* TOP INFORMATION */}

                    <div className="product-card-top">

                      <span className="product-category">
                        {product.category}
                      </span>

                      <span
                        className={
                          product.is_available
                            ? "available"
                            : "unavailable"
                        }
                      >
                        {product.is_available
                          ? "Available"
                          : "Unavailable"}
                      </span>

                    </div>


                    <h3>
                      {product.name}
                    </h3>


                    <p>
                      {product.description ||
                        "No description available."}
                    </p>


                    <div className="product-info">

                      <strong>
                        Rs. {product.price}
                      </strong>

                      <span>
                        {product.quantity}{" "}
                        {product.unit}
                      </span>

                    </div>


                    <p className="product-location">

                      📍{" "}
                      {product.location ||
                        "Nepal"}

                    </p>


                    {/* ACTIONS */}

                    <div className="product-actions">

                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          handleEditClick(
                            product
                          )
                        }
                        disabled={isDeleting}
                      >
                        ✏️ Edit
                      </button>


                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDelete(
                            productId
                          )
                        }
                        disabled={
                          isDeleting ||
                          !productId
                        }
                      >
                        {isDeleting
                          ? "Deleting..."
                          : "🗑️ Delete"}
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>
          )}

        </section>

      </main>


      {/* ================= FOOTER ================= */}

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


export default FarmerProducts;