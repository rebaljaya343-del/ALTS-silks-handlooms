"""initial Srinath schema"""
from alembic import op
import sqlalchemy as sa

revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('users', sa.Column('id', sa.String(80), primary_key=True), sa.Column('name', sa.String(160), nullable=False), sa.Column('email', sa.String(255), nullable=False, unique=True), sa.Column('password_hash', sa.String(255), nullable=False), sa.Column('role', sa.String(20), nullable=False), sa.Column('role_title', sa.String(160)), sa.Column('avatar', sa.String(500)), sa.Column('created_at', sa.DateTime(timezone=True), nullable=False))
    op.create_table('sarees', sa.Column('id', sa.String(80), primary_key=True), sa.Column('name', sa.String(255), nullable=False), sa.Column('sku', sa.String(80), nullable=False, unique=True), sa.Column('category', sa.String(120), nullable=False), sa.Column('fabric', sa.String(120), nullable=False), sa.Column('occasion', sa.String(120), nullable=False), sa.Column('price', sa.Numeric(12, 2), nullable=False), sa.Column('cost_price', sa.Numeric(12, 2), nullable=False), sa.Column('stock', sa.Integer, nullable=False, server_default='0'), sa.Column('low_stock_threshold', sa.Integer, nullable=False, server_default='5'), sa.Column('images', sa.JSON, nullable=False), sa.Column('created_at', sa.DateTime(timezone=True), nullable=False), sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False))
    op.create_table('customers', sa.Column('id', sa.String(80), primary_key=True), sa.Column('name', sa.String(160), nullable=False), sa.Column('phone', sa.String(40), nullable=False), sa.Column('email', sa.String(255), nullable=False), sa.Column('city', sa.String(120), nullable=False), sa.Column('tier', sa.String(40), nullable=False), sa.Column('total_orders', sa.Integer, nullable=False, server_default='0'), sa.Column('total_spend', sa.Numeric(12, 2), nullable=False, server_default='0'), sa.Column('created_at', sa.DateTime(timezone=True), nullable=False), sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False))
    op.create_table('orders', sa.Column('id', sa.String(80), primary_key=True), sa.Column('order_number', sa.String(80), nullable=False, unique=True), sa.Column('invoice_number', sa.String(80), nullable=False, unique=True), sa.Column('customer_id', sa.String(80), sa.ForeignKey('customers.id')), sa.Column('customer_name', sa.String(160), nullable=False), sa.Column('customer_phone', sa.String(40), nullable=False), sa.Column('subtotal', sa.Numeric(12, 2), nullable=False), sa.Column('discount', sa.Numeric(12, 2), nullable=False), sa.Column('tax', sa.Numeric(12, 2), nullable=False), sa.Column('total_amount', sa.Numeric(12, 2), nullable=False), sa.Column('payment_method', sa.String(20), nullable=False), sa.Column('status', sa.String(30), nullable=False), sa.Column('notes', sa.Text, nullable=False), sa.Column('date', sa.DateTime(timezone=True), nullable=False), sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False))
    op.create_table('order_items', sa.Column('id', sa.String(80), primary_key=True), sa.Column('order_id', sa.String(80), sa.ForeignKey('orders.id'), nullable=False), sa.Column('saree_id', sa.String(80), sa.ForeignKey('sarees.id'), nullable=False), sa.Column('quantity', sa.Integer, nullable=False), sa.Column('price', sa.Numeric(12, 2), nullable=False))
    op.create_table('inventory_logs', sa.Column('id', sa.String(80), primary_key=True), sa.Column('saree_id', sa.String(80), sa.ForeignKey('sarees.id'), nullable=False), sa.Column('saree_name', sa.String(255), nullable=False), sa.Column('sku', sa.String(80), nullable=False), sa.Column('type', sa.String(5), nullable=False), sa.Column('quantity', sa.Integer, nullable=False), sa.Column('reason', sa.String(255), nullable=False), sa.Column('adjusted_by', sa.String(160), nullable=False), sa.Column('notes', sa.Text, nullable=False), sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False))

def downgrade():
    for table in ['inventory_logs', 'order_items', 'orders', 'customers', 'sarees', 'users']:
        op.drop_table(table)
