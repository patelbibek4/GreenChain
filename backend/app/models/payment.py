from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False,
        unique=True,
        index=True
    )

    customer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    amount = Column(
        Float,
        nullable=False
    )

    payment_method = Column(
        String(50),
        nullable=False
    )

    payment_status = Column(
        String(30),
        nullable=False,
        default="pending"
    )

    transaction_id = Column(
        String(150),
        nullable=True,
        unique=True,
        index=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )