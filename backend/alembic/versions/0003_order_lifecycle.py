"""order lifecycle and source fields

Revision ID: 0003_order_lifecycle
Revises: 0002_customer_auth
Create Date: 2026-09-28
"""
from alembic import op
import sqlalchemy as sa

revision = '0003_order_lifecycle'
down_revision = '0002_customer_auth'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('orders') as batch_op:
        batch_op.add_column(sa.Column('source', sa.String(length=20), nullable=False, server_default='Store'))
        batch_op.add_column(sa.Column('handled_by', sa.String(length=160), nullable=True))
        batch_op.add_column(sa.Column('handled_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('rejection_reason', sa.String(length=255), nullable=True))
    op.execute("UPDATE orders SET source='Store' WHERE source IS NULL OR source=''")


def downgrade():
    with op.batch_alter_table('orders') as batch_op:
        batch_op.drop_column('rejection_reason')
        batch_op.drop_column('handled_at')
        batch_op.drop_column('handled_by')
        batch_op.drop_column('source')
