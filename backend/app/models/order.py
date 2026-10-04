from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
        index=True
    )

    farmer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    quantity = Column(
        Float,
        nullable=False
    )

    total_price = Column(
        Float,
        nullable=False
    )

    status = Column(
        String(30),
        nullable=False,
        default="pending"
    )

    delivery_address = Column(
        String(255),
        nullable=False
    )

    # =========================
    # PAYMENT INFORMATION
    # =========================

    payment_method = Column(
        String(30),
        nullable=False,
        default="cod"
    )

    payment_status = Column(
        String(30),
        nullable=False,
        default="pending"
    )

    transaction_id = Column(
        String(255),
        nullable=True,
        unique=True,
        index=True
    )

    paid_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )