from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate
)
from app.security import get_current_user


router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


# ============================================================
# CREATE ORDER
# ============================================================

@router.post(
    "/",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can place orders"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    product = db.query(Product).filter(
        Product.id == order_data.product_id
    ).first()

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    if not product.is_available:
        raise HTTPException(
            status_code=400,
            detail="Product is not available"
        )

    if order_data.quantity > product.quantity:
        raise HTTPException(
            status_code=400,
            detail="Requested quantity is greater than available quantity"
        )

    total_price = product.price * order_data.quantity

    new_order = Order(
        customer_id=customer_id,
        product_id=product.id,
        farmer_id=product.farmer_id,
        quantity=order_data.quantity,
        total_price=total_price,
        status="pending",
        delivery_address=order_data.delivery_address
    )

    product.quantity -= order_data.quantity

    if product.quantity <= 0:
        product.quantity = 0
        product.is_available = False

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


# ============================================================
# CUSTOMER ORDER HISTORY
# ============================================================

@router.get(
    "/my-orders",
    response_model=list[OrderResponse]
)
def get_my_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    customer_id = current_user.get("sub")

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    orders = db.query(Order).filter(
        Order.customer_id == customer_id
    ).order_by(
        Order.id.desc()
    ).all()

    return orders


# ============================================================
# CUSTOMER SINGLE ORDER
# ============================================================

@router.get(
    "/my-orders/{order_id}",
    response_model=OrderResponse
)
def get_my_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    customer_id = current_user.get("sub")

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == customer_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return order


# ============================================================
# FARMER ORDER LIST
# ============================================================

@router.get(
    "/farmer-orders",
    response_model=list[OrderResponse]
)
def get_farmer_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    farmer_id = current_user.get("sub")
    farmer_role = current_user.get("role")

    if farmer_role != "farmer":
        raise HTTPException(
            status_code=403,
            detail="Only farmers can view farmer orders"
        )

    if farmer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Farmer ID not found"
        )

    farmer_id = int(farmer_id)

    orders = db.query(Order).filter(
        Order.farmer_id == farmer_id
    ).order_by(
        Order.id.desc()
    ).all()

    return orders


# ============================================================
# FARMER UPDATE ORDER STATUS
# ============================================================

@router.put(
    "/farmer-orders/{order_id}/status",
    response_model=OrderResponse
)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    farmer_id = current_user.get("sub")
    farmer_role = current_user.get("role")

    if farmer_role != "farmer":
        raise HTTPException(
            status_code=403,
            detail="Only farmers can update orders"
        )

    if farmer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Farmer ID not found"
        )

    farmer_id = int(farmer_id)

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.farmer_id == farmer_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    # GreenChain order workflow
    allowed_statuses = [
        "pending",
        "confirmed",
        "shipped",
        "delivered"
    ]

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status"
        )

    # Cancelled orders cannot be changed by farmer
    if order.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cancelled orders cannot be updated"
        )

    # Delivered orders are final
    if order.status == "delivered":
        raise HTTPException(
            status_code=400,
            detail="Delivered orders cannot be updated"
        )

    # Prevent moving backwards in the order workflow
    status_order = {
        "pending": 0,
        "confirmed": 1,
        "shipped": 2,
        "delivered": 3
    }

    current_status = order.status

    if current_status not in status_order:
        raise HTTPException(
            status_code=400,
            detail="Current order status is invalid"
        )

    current_position = status_order[current_status]
    new_position = status_order[status_data.status]

    if new_position < current_position:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Order cannot move backward from "
                f"{current_status} to {status_data.status}"
            )
        )

    order.status = status_data.status

    db.commit()
    db.refresh(order)

    return order


# ============================================================
# CUSTOMER CANCEL ORDER
# ============================================================

@router.put(
    "/my-orders/{order_id}/cancel",
    response_model=OrderResponse
)
def cancel_my_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    customer_id = current_user.get("sub")

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == customer_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if order.status != "pending":
        raise HTTPException(
            status_code=400,
            detail="Only pending orders can be cancelled"
        )

    order.status = "cancelled"

    product = db.query(Product).filter(
        Product.id == order.product_id
    ).first()

    if product is not None:
        product.quantity += order.quantity
        product.is_available = True

    db.commit()
    db.refresh(order)

    return order


# ============================================================
# CUSTOMER ORDER TRACKING
# ============================================================

@router.get(
    "/my-orders/{order_id}/tracking"
)
def track_my_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    customer_id = current_user.get("sub")

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == customer_id
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    product = db.query(Product).filter(
        Product.id == order.product_id
    ).first()

    return {
        "order_id": order.id,
        "product_id": order.product_id,
        "product_name": product.name if product else "Unknown",
        "quantity": order.quantity,
        "total_price": order.total_price,
        "delivery_address": order.delivery_address,
        "status": order.status,
        "created_at": order.created_at,
        "message": f"Your order is currently {order.status}"
    }