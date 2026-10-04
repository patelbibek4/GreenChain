"""add payment fields to orders

Revision ID: 994962444015
Revises: ed6836858c55
Create Date: 2026-10-01 21:08:46.622019
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "994962444015"
down_revision: Union[str, Sequence[str], None] = "ed6836858c55"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add payment method with a temporary default.
    # This allows existing orders to receive a value.
    op.add_column(
        "orders",
        sa.Column(
            "payment_method",
            sa.String(length=30),
            nullable=False,
            server_default="cash_on_delivery",
        ),
    )

    # Add payment status with a temporary default.
    # Existing orders will initially receive "pending".
    op.add_column(
        "orders",
        sa.Column(
            "payment_status",
            sa.String(length=30),
            nullable=False,
            server_default="pending",
        ),
    )

    # Transaction ID is optional.
    op.add_column(
        "orders",
        sa.Column(
            "transaction_id",
            sa.String(length=255),
            nullable=True,
        ),
    )

    # Payment date is optional.
    op.add_column(
        "orders",
        sa.Column(
            "paid_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # Transaction IDs must be unique when provided.
    op.create_index(
        op.f("ix_orders_transaction_id"),
        "orders",
        ["transaction_id"],
        unique=True,
    )

    # Remove the temporary database defaults after existing rows
    # have been populated.
    op.alter_column(
        "orders",
        "payment_method",
        server_default=None,
    )

    op.alter_column(
        "orders",
        "payment_status",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f("ix_orders_transaction_id"),
        table_name="orders",
    )

    op.drop_column(
        "orders",
        "paid_at",
    )

    op.drop_column(
        "orders",
        "transaction_id",
    )

    op.drop_column(
        "orders",
        "payment_status",
    )

    op.drop_column(
        "orders",
        "payment_method",
    )