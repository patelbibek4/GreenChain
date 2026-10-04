from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from sqlalchemy.sql import func

from app.database.connection import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(150),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    category = Column(
        String(100),
        nullable=False
    )

    price = Column(
        Float,
        nullable=False
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=0
    )

    unit = Column(
        String(50),
        nullable=False
    )

    location = Column(
        String(255),
        nullable=False
    )

    image_url = Column(
        String(500),
        nullable=True
    )

    is_available = Column(
        Boolean,
        nullable=False,
        default=True
    )

    farmer_id = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )