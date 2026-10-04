from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    product_id: int

    rating: float = Field(
        ...,
        ge=1,
        le=5
    )

    comment: str | None = None


class ReviewResponse(BaseModel):
    id: int
    customer_id: int
    product_id: int
    rating: float
    comment: str | None

    class Config:
        from_attributes = True