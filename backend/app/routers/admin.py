from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.payment import Payment
from app.security import require_role


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =========================================================
# ADMIN DASHBOARD
# =========================================================

@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    total_users = db.query(User).count()

    total_customers = (
        db.query(User)
        .filter(User.role == "customer")
        .count()
    )

    total_farmers = (
        db.query(User)
        .filter(User.role == "farmer")
        .count()
    )

    total_admins = (
        db.query(User)
        .filter(User.role == "admin")
        .count()
    )

    total_products = db.query(Product).count()

    available_products = (
        db.query(Product)
        .filter(Product.is_available == True)
        .count()
    )

    unavailable_products = (
        db.query(Product)
        .filter(Product.is_available == False)
        .count()
    )

    total_orders = db.query(Order).count()

    pending_orders = (
        db.query(Order)
        .filter(Order.status == "pending")
        .count()
    )

    confirmed_orders = (
        db.query(Order)
        .filter(Order.status == "confirmed")
        .count()
    )

    shipped_orders = (
        db.query(Order)
        .filter(Order.status == "shipped")
        .count()
    )

    delivered_orders = (
        db.query(Order)
        .filter(Order.status == "delivered")
        .count()
    )

    cancelled_orders = (
        db.query(Order)
        .filter(Order.status == "cancelled")
        .count()
    )

    completed_orders = (
        db.query(Order)
        .filter(Order.status == "delivered")
        .all()
    )

    total_sales = sum(
        float(order.total_price or 0)
        for order in completed_orders
    )

    return {
        "message": "GreenChain Admin Dashboard",

        "admin": {
            "user_id": current_user.get("sub"),
            "email": current_user.get("email"),
            "role": current_user.get("role")
        },

        "users": {
            "total": total_users,
            "customers": total_customers,
            "farmers": total_farmers,
            "admins": total_admins
        },

        "products": {
            "total": total_products,
            "available": available_products,
            "unavailable": unavailable_products
        },

        "orders": {
            "total": total_orders,
            "pending": pending_orders,
            "confirmed": confirmed_orders,
            "shipped": shipped_orders,
            "delivered": delivered_orders,
            "cancelled": cancelled_orders
        },

        "sales": {
            "total_sales": total_sales,
            "currency": "NPR"
        }
    }


# =========================================================
# ADMIN - GET ALL USERS
# =========================================================

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    users = (
        db.query(User)
        .order_by(User.id.desc())
        .all()
    )

    return {
        "message": "All GreenChain users",
        "total": len(users),

        "users": [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at
            }

            for user in users
        ]
    }


# =========================================================
# ADMIN - GET ALL PRODUCTS
# =========================================================

@router.get("/products")
def get_all_products(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    products = (
        db.query(Product)
        .order_by(Product.id.desc())
        .all()
    )

    product_list = []

    for product in products:

        farmer = (
            db.query(User)
            .filter(User.id == product.farmer_id)
            .first()
        )

        product_list.append(
            {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "category": product.category,
                "price": float(product.price),
                "quantity": product.quantity,
                "unit": product.unit,
                "location": product.location,
                "is_available": product.is_available,
                "created_at": product.created_at,

                "farmer": {
                    "id": farmer.id if farmer else None,
                    "name": farmer.name if farmer else "Unknown",
                    "email": farmer.email if farmer else None
                }
            }
        )

    return {
        "message": "All GreenChain products",
        "total": len(product_list),
        "products": product_list
    }


# =========================================================
# ADMIN - GET SINGLE PRODUCT
# =========================================================

@router.get("/products/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    farmer = (
        db.query(User)
        .filter(User.id == product.farmer_id)
        .first()
    )

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "price": float(product.price),
        "quantity": product.quantity,
        "unit": product.unit,
        "location": product.location,
        "is_available": product.is_available,
        "created_at": product.created_at,

        "farmer": {
            "id": farmer.id if farmer else None,
            "name": farmer.name if farmer else "Unknown",
            "email": farmer.email if farmer else None
        }
    }


# =========================================================
# ADMIN - CHANGE PRODUCT AVAILABILITY
# =========================================================

@router.put("/products/{product_id}/availability")
def update_product_availability(
    product_id: int,
    is_available: bool,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.is_available = is_available

    db.commit()
    db.refresh(product)

    return {
        "message": "Product availability updated successfully",
        "product": {
            "id": product.id,
            "name": product.name,
            "is_available": product.is_available
        }
    }


# =========================================================
# ADMIN - DELETE PRODUCT
# =========================================================

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully",
        "product_id": product_id
    }


# =========================================================
# ADMIN - GET ALL ORDERS
# =========================================================

@router.get("/orders")
def get_all_orders(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    orders = (
        db.query(Order)
        .order_by(Order.id.desc())
        .all()
    )

    order_list = []

    for order in orders:

        customer = (
            db.query(User)
            .filter(User.id == order.customer_id)
            .first()
        )

        farmer = (
            db.query(User)
            .filter(User.id == order.farmer_id)
            .first()
        )

        product = (
            db.query(Product)
            .filter(Product.id == order.product_id)
            .first()
        )

        order_list.append(
            {
                "id": order.id,
                "customer_id": order.customer_id,
                "farmer_id": order.farmer_id,
                "product_id": order.product_id,
                "quantity": order.quantity,
                "total_price": float(
                    order.total_price or 0
                ),
                "status": order.status,
                "delivery_address": order.delivery_address,
                "created_at": order.created_at,

                "customer": {
                    "id": customer.id if customer else None,
                    "name": (
                        customer.name
                        if customer
                        else "Unknown"
                    ),
                    "email": (
                        customer.email
                        if customer
                        else None
                    )
                },

                "farmer": {
                    "id": farmer.id if farmer else None,
                    "name": (
                        farmer.name
                        if farmer
                        else "Unknown"
                    ),
                    "email": (
                        farmer.email
                        if farmer
                        else None
                    )
                },

                "product": {
                    "id": product.id if product else None,
                    "name": (
                        product.name
                        if product
                        else "Unknown"
                    )
                }
            }
        )

    return {
        "message": "All GreenChain orders",
        "total": len(order_list),
        "orders": order_list
    }


# =========================================================
# ADMIN - ORDER STATISTICS
# IMPORTANT:
# This static route MUST come before /orders/{order_id}
# =========================================================

@router.get("/orders/statistics")
def get_order_statistics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    total_orders = db.query(Order).count()

    pending = (
        db.query(Order)
        .filter(Order.status == "pending")
        .count()
    )

    confirmed = (
        db.query(Order)
        .filter(Order.status == "confirmed")
        .count()
    )

    shipped = (
        db.query(Order)
        .filter(Order.status == "shipped")
        .count()
    )

    delivered = (
        db.query(Order)
        .filter(Order.status == "delivered")
        .count()
    )

    cancelled = (
        db.query(Order)
        .filter(Order.status == "cancelled")
        .count()
    )

    delivered_orders = (
        db.query(Order)
        .filter(Order.status == "delivered")
        .all()
    )

    completed_sales = sum(
        float(order.total_price or 0)
        for order in delivered_orders
    )

    return {
        "total_orders": total_orders,
        "pending": pending,
        "confirmed": confirmed,
        "shipped": shipped,
        "delivered": delivered,
        "cancelled": cancelled,
        "completed_sales": completed_sales,
        "currency": "NPR"
    }


# =========================================================
# ADMIN - GET SINGLE ORDER
# IMPORTANT:
# This dynamic route comes AFTER /orders/statistics
# =========================================================

@router.get("/orders/{order_id}")
def get_admin_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    customer = (
        db.query(User)
        .filter(User.id == order.customer_id)
        .first()
    )

    farmer = (
        db.query(User)
        .filter(User.id == order.farmer_id)
        .first()
    )

    product = (
        db.query(Product)
        .filter(Product.id == order.product_id)
        .first()
    )

    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "farmer_id": order.farmer_id,
        "product_id": order.product_id,
        "quantity": order.quantity,
        "total_price": float(
            order.total_price or 0
        ),
        "status": order.status,
        "delivery_address": order.delivery_address,
        "created_at": order.created_at,

        "customer": {
            "id": customer.id if customer else None,
            "name": (
                customer.name
                if customer
                else "Unknown"
            ),
            "email": (
                customer.email
                if customer
                else None
            )
        },

        "farmer": {
            "id": farmer.id if farmer else None,
            "name": (
                farmer.name
                if farmer
                else "Unknown"
            ),
            "email": (
                farmer.email
                if farmer
                else None
            )
        },

        "product": {
            "id": product.id if product else None,
            "name": (
                product.name
                if product
                else "Unknown"
            )
        }
    }


# =========================================================
# ADMIN - GET ALL PAYMENTS
# =========================================================

@router.get("/payments")
def get_all_payments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    payments = (
        db.query(Payment)
        .order_by(Payment.id.desc())
        .all()
    )

    payment_list = []

    for payment in payments:

        order = (
            db.query(Order)
            .filter(Order.id == payment.order_id)
            .first()
        )

        customer = (
            db.query(User)
            .filter(User.id == payment.customer_id)
            .first()
        )

        payment_list.append(
            {
                "id": payment.id,
                "payment_id": payment.id,
                "order_id": payment.order_id,
                "customer_id": payment.customer_id,
                "amount": float(payment.amount or 0),
                "payment_method": payment.payment_method,
                "payment_status": payment.payment_status,
                "transaction_id": payment.transaction_id,

                "created_at": (
                    payment.created_at
                    if hasattr(payment, "created_at")
                    else None
                ),

                "customer": {
                    "id": customer.id if customer else None,
                    "name": (
                        customer.name
                        if customer
                        else "Unknown"
                    ),
                    "email": (
                        customer.email
                        if customer
                        else None
                    )
                },

                "order": {
                    "id": order.id if order else None,
                    "status": (
                        order.status
                        if order
                        else "Unknown"
                    ),
                    "delivery_address": (
                        order.delivery_address
                        if order
                        else None
                    )
                }
            }
        )

    return {
        "message": "All GreenChain payments",
        "total": len(payment_list),
        "payments": payment_list
    }
