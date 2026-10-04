from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.review import Review
from app.models.product import Product
from app.models.order import Order
from app.schemas.review import ReviewCreate, ReviewResponse
from app.security import get_current_user


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


# =========================================================
# CREATE REVIEW
# =========================================================

@router.post(
    "/",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED
)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can create reviews"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    product = (
        db.query(Product)
        .filter(Product.id == review_data.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Check whether customer has purchased this product
    purchased = (
        db.query(Order)
        .filter(
            Order.customer_id == customer_id,
            Order.product_id == review_data.product_id
        )
        .first()
    )

    if purchased is None:
        raise HTTPException(
            status_code=400,
            detail="You can review only products you have ordered"
        )

    # Prevent duplicate review
    existing_review = (
        db.query(Review)
        .filter(
            Review.customer_id == customer_id,
            Review.product_id == review_data.product_id
        )
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this product"
        )

    new_review = Review(
        customer_id=customer_id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        comment=review_data.comment
    )

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review


# =========================================================
# GET PRODUCT REVIEWS
# =========================================================

@router.get("/{product_id}")
def get_product_reviews(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    reviews = (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.id.desc())
        .all()
    )

    result = []

    for review in reviews:

        result.append({
            "review_id": review.id,
            "customer_id": review.customer_id,
            "product_id": review.product_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at
        })

    return {
        "product_id": product_id,
        "product_name": product.name,
        "total_reviews": len(reviews),
        "reviews": result
    }


# =========================================================
# UPDATE MY REVIEW
# =========================================================

@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can update reviews"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    review = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.customer_id == customer_id
        )
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    if review.product_id != review_data.product_id:
        raise HTTPException(
            status_code=400,
            detail="Product cannot be changed"
        )

    review.rating = review_data.rating
    review.comment = review_data.comment

    db.commit()
    db.refresh(review)

    return review


# =========================================================
# DELETE MY REVIEW
# =========================================================

@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can delete reviews"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    review = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.customer_id == customer_id
        )
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    db.delete(review)
    db.commit()

    return {
        "message": "Review deleted successfully",
        "review_id": review_id
    }