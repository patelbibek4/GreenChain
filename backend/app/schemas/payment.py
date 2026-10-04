from typing import Literal

from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    order_id: int
    payment_method: Literal[
        "test",
        "esewa",
        "khalti",
        "cash_on_delivery"
    ]
    amount: float = Field(..., gt=0)


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    customer_id: int
    amount: float
    payment_method: str
    payment_status: str
    transaction_id: str | None

    class Config:
        from_attributes = True