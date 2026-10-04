from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pwdlib import PasswordHash

from app.database.connection import get_db
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    UserProfileUpdate
)
from app.security import create_access_token, get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


password_hash = PasswordHash.recommended()


# =========================================================
# CREATE USER
# =========================================================

@router.post("/", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # -----------------------------------------------------
    # SECURITY:
    # Public registration can only create customers
    # or farmers.
    #
    # Admin accounts must NOT be created through this
    # public registration endpoint.
    # -----------------------------------------------------

    allowed_roles = ["customer", "farmer"]

    if user_data.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="Invalid role. Public registration only allows customer or farmer."
        )

    # -----------------------------------------------------
    # CHECK EMAIL
    # -----------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # -----------------------------------------------------
    # CHECK PHONE
    # -----------------------------------------------------

    existing_phone = (
        db.query(User)
        .filter(User.phone == user_data.phone)
        .first()
    )

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone already registered"
        )

    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=password_hash.hash(user_data.password),
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================================================
# LOGIN USER
# =========================================================

@router.post("/login")
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    if not password_hash.verify(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


# =========================================================
# GET CURRENT USER
# =========================================================

@router.get("/me")
def get_me(
    current_user: dict = Depends(get_current_user)
):
    return {
        "message": "Authentication successful",
        "user_id": current_user.get("sub"),
        "email": current_user.get("email"),
        "role": current_user.get("role")
    }


# =========================================================
# GET USER PROFILE
# =========================================================

@router.get("/profile", response_model=UserResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="User ID not found"
        )

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# =========================================================
# UPDATE USER PROFILE
# =========================================================

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="User ID not found"
        )

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_email = (
        db.query(User)
        .filter(
            User.email == user_data.email,
            User.id != int(user_id)
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_phone = (
        db.query(User)
        .filter(
            User.phone == user_data.phone,
            User.id != int(user_id)
        )
        .first()
    )

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone already registered"
        )

    user.name = user_data.name
    user.email = user_data.email
    user.phone = user_data.phone

    db.commit()
    db.refresh(user)

    return user


# =========================================================
# CUSTOMER DASHBOARD
# =========================================================

@router.get("/dashboard")
def customer_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("sub")
    user_role = current_user.get("role")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="User ID not found"
        )

    if user_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can access the customer dashboard"
        )

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    orders = (
        db.query(Order)
        .filter(Order.customer_id == int(user_id))
        .order_by(Order.id.desc())
        .all()
    )

    total_orders = len(orders)

    pending_orders = sum(
        1
        for order in orders
        if order.status == "pending"
    )

    active_orders = sum(
        1
        for order in orders
        if order.status in [
            "accepted",
            "preparing",
            "ready",
            "out_for_delivery"
        ]
    )

    delivered_orders = sum(
        1
        for order in orders
        if order.status == "delivered"
    )

    cancelled_orders = sum(
        1
        for order in orders
        if order.status in [
            "cancelled",
            "rejected"
        ]
    )

    recent_orders = []

    for order in orders[:5]:

        product = (
            db.query(Product)
            .filter(Product.id == order.product_id)
            .first()
        )

        recent_orders.append({
            "order_id": order.id,
            "product_id": order.product_id,
            "product_name": (
                product.name
                if product
                else "Unknown"
            ),
            "quantity": order.quantity,
            "total_price": order.total_price,
            "status": order.status,
            "delivery_address": order.delivery_address
        })

    return {
        "message": "Customer dashboard",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,

        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "active": active_orders,
            "delivered": delivered_orders,
            "cancelled": cancelled_orders
        },

        "recent_orders": recent_orders
    }