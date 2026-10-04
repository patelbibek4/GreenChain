from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.schemas.cart import (
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse
)
from app.security import get_current_user


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


# =========================================================
# ADD PRODUCT TO CART
# =========================================================

@router.post(
    "/",
    response_model=CartItemResponse,
    status_code=status.HTTP_201_CREATED
)
def add_to_cart(
    cart_data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can use the cart"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    # Check product
    product = (
        db.query(Product)
        .filter(
            Product.id == cart_data.product_id,
            Product.is_available == True
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found or unavailable"
        )

    # Check stock
    if cart_data.quantity > product.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.quantity} units available"
        )

    # Check existing cart item
    existing_item = (
        db.query(CartItem)
        .filter(
            CartItem.customer_id == customer_id,
            CartItem.product_id == cart_data.product_id
        )
        .first()
    )

    if existing_item:

        new_quantity = (
            existing_item.quantity +
            cart_data.quantity
        )

        if new_quantity > product.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Only {product.quantity} units available"
            )

        existing_item.quantity = new_quantity

        db.commit()
        db.refresh(existing_item)

        return existing_item

    # Create new cart item
    new_item = CartItem(
        customer_id=customer_id,
        product_id=cart_data.product_id,
        quantity=cart_data.quantity
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


# =========================================================
# GET MY CART
# =========================================================

@router.get("/")
def get_my_cart(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can use the cart"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    cart_items = (
        db.query(CartItem)
        .filter(
            CartItem.customer_id == customer_id
        )
        .order_by(CartItem.id.desc())
        .all()
    )

    items = []
    subtotal = 0

    for item in cart_items:

        product = (
            db.query(Product)
            .filter(Product.id == item.product_id)
            .first()
        )

        if product is None:
            continue

        item_total = (
            float(product.price) *
            float(item.quantity)
        )

        subtotal += item_total

        items.append({
            "cart_item_id": item.id,
            "product_id": product.id,
            "product_name": product.name,
            "price": product.price,
            "quantity": item.quantity,
            "unit": product.unit,
            "item_total": item_total,
            "location": product.location,
            "is_available": product.is_available
        })

    return {
        "customer_id": customer_id,
        "total_items": len(items),
        "subtotal": subtotal,
        "items": items
    }


# =========================================================
# UPDATE CART ITEM
# =========================================================

@router.put(
    "/{cart_item_id}",
    response_model=CartItemResponse
)
def update_cart_item(
    cart_item_id: int,
    cart_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can use the cart"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.customer_id == customer_id
        )
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    product = (
        db.query(Product)
        .filter(Product.id == cart_item.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if cart_data.quantity > product.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.quantity} units available"
        )

    cart_item.quantity = cart_data.quantity

    db.commit()
    db.refresh(cart_item)

    return cart_item


# =========================================================
# REMOVE CART ITEM
# =========================================================

@router.delete("/{cart_item_id}")
def remove_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can use the cart"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.id == cart_item_id,
            CartItem.customer_id == customer_id
        )
        .first()
    )

    if cart_item is None:
        raise HTTPException(
            status_code=404,
            detail="Cart item not found"
        )

    db.delete(cart_item)
    db.commit()

    return {
        "message": "Cart item removed successfully",
        "cart_item_id": cart_item_id
    }