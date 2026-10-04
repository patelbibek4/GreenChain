from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.schemas.wishlist import WishlistResponse
from app.security import get_current_user


router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"]
)


# =========================================================
# ADD PRODUCT TO WISHLIST
# =========================================================

@router.post(
    "/{product_id}",
    response_model=WishlistResponse,
    status_code=status.HTTP_201_CREATED
)
def add_to_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can use wishlist"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

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

    existing = (
        db.query(Wishlist)
        .filter(
            Wishlist.customer_id == customer_id,
            Wishlist.product_id == product_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Product already in wishlist"
        )

    wishlist_item = Wishlist(
        customer_id=customer_id,
        product_id=product_id
    )

    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)

    return wishlist_item


# =========================================================
# GET MY WISHLIST
# =========================================================

@router.get("/")
def get_my_wishlist(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can use wishlist"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    wishlist_items = (
        db.query(Wishlist)
        .filter(Wishlist.customer_id == customer_id)
        .order_by(Wishlist.id.desc())
        .all()
    )

    result = []

    for item in wishlist_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        result.append({
            "wishlist_id": item.id,
            "product_id": item.product_id,
            "product_name": product.name if product else "Unknown",
            "price": product.price if product else None,
            "quantity": product.quantity if product else None,
            "unit": product.unit if product else None,
            "location": product.location if product else None,
            "is_available": (
                product.is_available
                if product
                else False
            )
        })

    return result


# =========================================================
# REMOVE PRODUCT FROM WISHLIST
# =========================================================

@router.delete("/{product_id}")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can use wishlist"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    wishlist_item = (
        db.query(Wishlist)
        .filter(
            Wishlist.customer_id == customer_id,
            Wishlist.product_id == product_id
        )
        .first()
    )

    if wishlist_item is None:
        raise HTTPException(
            status_code=404,
            detail="Product is not in wishlist"
        )

    db.delete(wishlist_item)
    db.commit()

    return {
        "message": "Product removed from wishlist",
        "product_id": product_id
    }