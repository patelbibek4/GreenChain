from pydantic import BaseModel, Field


# =========================================================
# ADD TO CART
# =========================================================

class CartItemCreate(BaseModel):

    product_id: int

    quantity: float = Field(
        ...,
        gt=0
    )


# =========================================================
# UPDATE CART QUANTITY
# =========================================================

class CartItemUpdate(BaseModel):

    quantity: float = Field(
        ...,
        gt=0
    )


# =========================================================
# CART RESPONSE
# =========================================================

class CartItemResponse(BaseModel):

    id: int
    customer_id: int
    product_id: int
    quantity: float

    class Config:
        from_attributes = True