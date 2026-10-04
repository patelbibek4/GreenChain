from pydantic import BaseModel


class WishlistResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int

    class Config:
        from_attributes = True