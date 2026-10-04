import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.payment import Payment
from app.models.order import Order
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.security import get_current_user


router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


# =========================================================
# CREATE PAYMENT
# =========================================================

@router.post(
    "/",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can make payments"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    order = (
        db.query(Order)
        .filter(
            Order.id == payment_data.order_id,
            Order.customer_id == customer_id
        )
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    if payment_data.amount != order.total_price:
        raise HTTPException(
            status_code=400,
            detail="Payment amount does not match order total"
        )

    existing_payment = (
        db.query(Payment)
        .filter(
            Payment.order_id == order.id
        )
        .first()
    )

    if existing_payment:
        raise HTTPException(
            status_code=400,
            detail="Payment already exists for this order"
        )

    transaction_id = f"GC-{uuid.uuid4().hex[:12].upper()}"

    new_payment = Payment(
        order_id=order.id,
        customer_id=customer_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        payment_status="paid",
        transaction_id=transaction_id
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)

    return new_payment


# =========================================================
# GET MY PAYMENT HISTORY
# =========================================================

@router.get("/")
def get_my_payments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can view payment history"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    payments = (
        db.query(Payment)
        .filter(
            Payment.customer_id == customer_id
        )
        .order_by(Payment.id.desc())
        .all()
    )

    return payments


# =========================================================
# GET PAYMENT BY ORDER
# IMPORTANT: This route MUST come before /{payment_id}
# =========================================================

@router.get("/order/{order_id}")
def get_order_payment_status(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can view payment status"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.customer_id == customer_id
        )
        .first()
    )

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    payment = (
        db.query(Payment)
        .filter(
            Payment.order_id == order.id
        )
        .first()
    )

    if payment is None:
        return {
            "order_id": order.id,
            "payment_status": "unpaid",
            "message": "No payment has been made for this order"
        }

    return {
        "order_id": order.id,
        "payment_id": payment.id,
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "payment_status": payment.payment_status,
        "transaction_id": payment.transaction_id
    }


# =========================================================
# GET PAYMENT BY PAYMENT ID
# =========================================================

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    customer_id = current_user.get("sub")
    customer_role = current_user.get("role")

    if customer_role != "customer":
        raise HTTPException(
            status_code=403,
            detail="Only customers can view payment details"
        )

    if customer_id is None:
        raise HTTPException(
            status_code=401,
            detail="Customer ID not found"
        )

    customer_id = int(customer_id)

    payment = (
        db.query(Payment)
        .filter(
            Payment.id == payment_id,
            Payment.customer_id == customer_id
        )
        .first()
    )

    if payment is None:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment