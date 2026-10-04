import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function ProductReviews({ productId }) {
  const { user, isLoggedIn } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [productName, setProductName] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingRating, setEditingRating] = useState(5);
  const [editingComment, setEditingComment] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // CURRENT USER ID
  // Backend login response uses user_id
  // =========================================================

  const currentUserId =
    user?.user_id ??
    user?.id ??
    user?.user?.id ??
    null;

  // =========================================================
  // LOAD REVIEWS
  // =========================================================

  const loadReviews = async () => {
    if (!productId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/reviews/${productId}`
      );

      const data = response.data;

      console.log("Product reviews:", data);

      if (data && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        setProductName(data.product_name || "");
      } else if (Array.isArray(data)) {
        setReviews(data);
      } else if (Array.isArray(data?.items)) {
        setReviews(data.items);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error(
        "Error loading reviews:",
        err
      );

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to load product reviews."
        );
      } else {
        setError(
          "Unable to load product reviews."
        );
      }

      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  // =========================================================
  // GET REVIEW ID
  // =========================================================

  const getReviewId = (review) => {
    return (
      review?.review_id ??
      review?.id ??
      null
    );
  };

  // =========================================================
  // GET REVIEW CUSTOMER ID
  // =========================================================

  const getReviewCustomerId = (review) => {
    return (
      review?.customer_id ??
      review?.user_id ??
      review?.customer?.id ??
      review?.user?.id ??
      null
    );
  };

  // =========================================================
  // CHECK WHETHER CURRENT CUSTOMER ALREADY REVIEWED
  // =========================================================

  const hasAlreadyReviewed = reviews.some(
    (review) => {
      const reviewCustomerId =
        getReviewCustomerId(review);

      return (
        isLoggedIn &&
        user?.role === "customer" &&
        currentUserId !== null &&
        Number(reviewCustomerId) ===
          Number(currentUserId)
      );
    }
  );

  // =========================================================
  // SUBMIT REVIEW
  // =========================================================

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!isLoggedIn) {
      setError(
        "Please login before writing a review."
      );
      return;
    }

    if (user?.role !== "customer") {
      setError(
        "Only customer accounts can write reviews."
      );
      return;
    }

    if (hasAlreadyReviewed) {
      setError(
        "You have already reviewed this product."
      );
      return;
    }

    if (rating < 1 || rating > 5) {
      setError(
        "Rating must be between 1 and 5."
      );
      return;
    }

    if (!comment.trim()) {
      setError(
        "Please write a review comment."
      );
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/reviews/", {
        product_id: Number(productId),
        rating: Number(rating),
        comment: comment.trim(),
      });

      setComment("");
      setRating(5);

      setSuccess(
        "Your review was added successfully! ⭐"
      );

      await loadReviews();
    } catch (err) {
      console.error(
        "Error adding review:",
        err
      );

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to add your review. Please try again."
        );
      } else {
        setError(
          "Unable to add your review. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // START EDITING
  // =========================================================

  const startEditing = (review) => {
    setEditingId(
      getReviewId(review)
    );

    setEditingRating(
      Number(review?.rating || 5)
    );

    setEditingComment(
      review?.comment || ""
    );

    setError("");
    setSuccess("");
  };

  // =========================================================
  // CANCEL EDITING
  // =========================================================

  const cancelEditing = () => {
    setEditingId(null);
    setEditingRating(5);
    setEditingComment("");
  };

  // =========================================================
  // UPDATE REVIEW
  // =========================================================

  const handleUpdateReview = async (
    reviewId
  ) => {
    setError("");
    setSuccess("");

    if (!editingComment.trim()) {
      setError(
        "Review comment cannot be empty."
      );
      return;
    }

    if (
      editingRating < 1 ||
      editingRating > 5
    ) {
      setError(
        "Rating must be between 1 and 5."
      );
      return;
    }

    setSubmitting(true);

    try {
      await api.put(
        `/reviews/${reviewId}`,
        {
          rating: Number(editingRating),
          comment:
            editingComment.trim(),
        }
      );

      setSuccess(
        "Your review was updated successfully! ✏️"
      );

      cancelEditing();

      await loadReviews();
    } catch (err) {
      console.error(
        "Error updating review:",
        err
      );

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to update your review."
        );
      } else {
        setError(
          "Unable to update your review."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // DELETE REVIEW
  // =========================================================

  const handleDeleteReview = async (
    reviewId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(reviewId);
    setError("");
    setSuccess("");

    try {
      await api.delete(
        `/reviews/${reviewId}`
      );

      setSuccess(
        "Your review was deleted successfully."
      );

      await loadReviews();
    } catch (err) {
      console.error(
        "Error deleting review:",
        err
      );

      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;

        setError(
          typeof detail === "string"
            ? detail
            : "Unable to delete your review."
        );
      } else {
        setError(
          "Unable to delete your review."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // AVERAGE RATING
  // =========================================================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total +
              Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <section className="product-reviews">

      <div className="container">

        {/* Header */}
        <div className="reviews-header">

          <div>
            <h2>
              ⭐ Customer Reviews
            </h2>

            {productName && (
              <p>
                Reviews for {productName}
              </p>
            )}
          </div>

          <div className="review-summary">

            <strong>
              {averageRating}
            </strong>

            <span>
              / 5
            </span>

            <span>
              (
              {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
              )
            </span>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* Review Form */}
        {isLoggedIn &&
          user?.role === "customer" &&
          !hasAlreadyReviewed && (

            <div className="review-form-card">

              <h3>
                Write a Review
              </h3>

              <form
                onSubmit={
                  handleSubmitReview
                }
              >

                {/* Rating */}
                <div className="rating-input">

                  <label htmlFor="review-rating">
                    Rating
                  </label>

                  <select
                    id="review-rating"
                    value={rating}
                    onChange={(event) =>
                      setRating(
                        Number(
                          event.target.value
                        )
                      )
                    }
                  >

                    <option value={5}>
                      ⭐⭐⭐⭐⭐ — 5
                    </option>

                    <option value={4}>
                      ⭐⭐⭐⭐ — 4
                    </option>

                    <option value={3}>
                      ⭐⭐⭐ — 3
                    </option>

                    <option value={2}>
                      ⭐⭐ — 2
                    </option>

                    <option value={1}>
                      ⭐ — 1
                    </option>

                  </select>

                </div>

                {/* Comment */}
                <div className="review-comment">

                  <label htmlFor="review-comment">
                    Your Review
                  </label>

                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(event) =>
                      setComment(
                        event.target.value
                      )
                    }
                    placeholder="Share your experience with this product..."
                    rows="5"
                    maxLength="1000"
                  />

                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting..."
                    : "⭐ Submit Review"}
                </button>

              </form>

            </div>
          )}

        {/* Already Reviewed */}
        {isLoggedIn &&
          user?.role === "customer" &&
          hasAlreadyReviewed && (

            <div className="review-login-message">

              <p>
                You have already reviewed
                this product.
              </p>

            </div>
          )}

        {/* Login Message */}
        {!isLoggedIn && (

          <div className="review-login-message">

            <p>
              Please{" "}
              <Link to="/login">
                login
              </Link>{" "}
              to write a review.
            </p>

          </div>
        )}

        {/* Reviews */}
        <div className="reviews-list">

          {loading ? (

            <p className="loading-message">
              Loading reviews...
            </p>

          ) : reviews.length === 0 ? (

            <div className="empty-reviews">

              <div className="empty-review-icon">
                ⭐
              </div>

              <h3>
                No Reviews Yet
              </h3>

              <p>
                Be the first customer to
                review this product.
              </p>

            </div>

          ) : (

            reviews.map((review) => {

              const reviewId =
                getReviewId(review);

              const reviewCustomerId =
                getReviewCustomerId(
                  review
                );

              const isOwner =
                currentUserId !== null &&
                reviewCustomerId !== null &&
                Number(
                  reviewCustomerId
                ) === Number(
                  currentUserId
                );

              const reviewDate =
                review.created_at
                  ? new Date(
                      review.created_at
                    ).toLocaleDateString()
                  : "";

              const reviewRating =
                Number(
                  review.rating || 0
                );

              return (

                <article
                  className="review-card"
                  key={reviewId}
                >

                  {editingId === reviewId ? (

                    /* Edit Form */
                    <div className="review-edit-form">

                      <h3>
                        Edit Your Review
                      </h3>

                      <div className="rating-input">

                        <label>
                          Rating
                        </label>

                        <select
                          value={
                            editingRating
                          }
                          onChange={(event) =>
                            setEditingRating(
                              Number(
                                event.target.value
                              )
                            )
                          }
                        >

                          <option value={5}>
                            ⭐⭐⭐⭐⭐ — 5
                          </option>

                          <option value={4}>
                            ⭐⭐⭐⭐ — 4
                          </option>

                          <option value={3}>
                            ⭐⭐⭐ — 3
                          </option>

                          <option value={2}>
                            ⭐⭐ — 2
                          </option>

                          <option value={1}>
                            ⭐ — 1
                          </option>

                        </select>

                      </div>

                      <textarea
                        value={
                          editingComment
                        }
                        onChange={(event) =>
                          setEditingComment(
                            event.target.value
                          )
                        }
                        rows="4"
                        maxLength="1000"
                      />

                      <div className="review-actions">

                        <button
                          type="button"
                          className="primary-button"
                          onClick={() =>
                            handleUpdateReview(
                              reviewId
                            )
                          }
                          disabled={submitting}
                        >
                          {submitting
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={
                            cancelEditing
                          }
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    /* Review Display */
                    <>

                      <div className="review-card-header">

                        <div>

                          <h3>
                            Customer #
                            {reviewCustomerId ||
                              "Unknown"}
                          </h3>

                          <div className="review-stars">

                            {"⭐".repeat(
                              Math.max(
                                0,
                                Math.min(
                                  5,
                                  reviewRating
                                )
                              )
                            )}

                          </div>

                        </div>

                        {reviewDate && (

                          <span className="review-date">
                            {reviewDate}
                          </span>

                        )}

                      </div>

                      <p className="review-text">
                        {review.comment}
                      </p>

                      {/* Owner Actions */}
                      {isOwner && (

                        <div className="review-actions">

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                              startEditing(
                                review
                              )
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="remove-wishlist-button"
                            onClick={() =>
                              handleDeleteReview(
                                reviewId
                              )
                            }
                            disabled={
                              deletingId ===
                              reviewId
                            }
                          >
                            {deletingId ===
                            reviewId
                              ? "Deleting..."
                              : "🗑️ Delete"}
                          </button>

                        </div>
                      )}

                    </>
                  )}

                </article>
              );
            })
          )}

        </div>

      </div>

    </section>
  );
}

export default ProductReviews;