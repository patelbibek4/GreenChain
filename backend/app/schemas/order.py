from pydantic import BaseModel, Field


class OrderCreate(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)
    delivery_address: str


class OrderStatusUpdate(BaseModel):
    status: str


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int
    farmer_id: int
    quantity: float
    total_price: float
    status: str
    delivery_address: str

    class Config:
        from_attributes = True