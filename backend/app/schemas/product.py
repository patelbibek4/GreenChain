from typing import Optional

from pydantic import BaseModel, Field


# =========================================================
# CREATE / UPDATE PRODUCT
# =========================================================

class ProductCreate(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=150
    )

    description: Optional[str] = Field(
        default=None,
        max_length=2000
    )

    category: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    price: float = Field(
        ...,
        gt=0
    )

    quantity: float = Field(
        ...,
        gt=0
    )

    unit: str = Field(
        ...,
        min_length=1,
        max_length=30
    )

    location: Optional[str] = Field(
        default=None,
        max_length=200
    )


# =========================================================
# PRODUCT RESPONSE
# =========================================================

class ProductResponse(BaseModel):

    id: int

    farmer_id: int

    name: str

    description: Optional[str]

    category: str

    price: float

    quantity: float

    unit: str

    location: Optional[str]

    image_url: Optional[str] = None

    is_available: bool

    class Config:
        from_attributes = True