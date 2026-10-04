from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse


# =========================================================
# MARKETPLACE ROUTER
# =========================================================

router = APIRouter(
    prefix="/products",
    tags=["Marketplace"]
)


# =========================================================
# GET PRODUCTS WITH SEARCH & FILTERS
# =========================================================

@router.get(
    "/",
    response_model=list[ProductResponse]
)
def get_all_products(
    search: str | None = None,
    category: str | None = None,
    location: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db)
):

    query = (
        db.query(Product)
        .filter(
            Product.is_available == True
        )
    )

    # Search by product name
    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%")
        )

    # Filter by category
    if category:
        query = query.filter(
            Product.category.ilike(f"%{category}%")
        )

    # Filter by location
    if location:
        query = query.filter(
            Product.location.ilike(f"%{location}%")
        )

    # Minimum price
    if min_price is not None:
        query = query.filter(
            Product.price >= min_price
        )

    # Maximum price
    if max_price is not None:
        query = query.filter(
            Product.price <= max_price
        )

    products = (
        query
        .order_by(Product.id.desc())
        .all()
    )

    return products


# =========================================================
# GET SINGLE PRODUCT
# =========================================================

@router.get(
    "/{product_id}",
    response_model=ProductResponse
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id,
            Product.is_available == True
        )
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product