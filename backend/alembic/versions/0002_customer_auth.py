"""customer auth fields"""
from alembic import op
import sqlalchemy as sa

revision = '0002_customer_auth'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('customers') as batch_op:
        batch_op.add_column(sa.Column('password_hash', sa.String(length=255), nullable=False, server_default=''))
        batch_op.create_index(batch_op.f('ix_customers_email'), ['email'], unique=True)
    op.execute("UPDATE customers SET password_hash='' WHERE password_hash IS NULL")


def downgrade():
    with op.batch_alter_table('customers') as batch_op:
        batch_op.drop_index(batch_op.f('ix_customers_email'))
        batch_op.drop_column('password_hash')
