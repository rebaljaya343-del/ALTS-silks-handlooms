from datetime import datetime, timezone
from decimal import Decimal

from app.auth import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Customer, Saree, User

SAREES = [
    ('sar-1', 'Kanjivaram Pure Zari Bridal Silk Saree', 'KAN-101', 'Kanjivaram', 'Pure Mulberry Silk', 'Bridal', 38500, 26000, 7, 4, ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80']),
    ('sar-2', 'Banarasi Katan Silk Kadwa Brocade Saree', 'BAN-202', 'Banarasi', 'Katan Silk', 'Festive', 32000, 21500, 3, 5, ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80']),
    ('sar-3', 'Gadwal Handloom Pure Silk Contrast Saree', 'GAD-305', 'Pattu', 'Pure Silk', 'Traditional', 24500, 16500, 12, 4, ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80']),
    ('sar-4', 'Pochampally Ikat Silk Geometric Saree', 'POC-408', 'Pattu', 'Soft Silk', 'Festive', 18500, 12000, 2, 4, ['https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=80']),
    ('sar-5', 'Chanderi Silk Cotton Pastel Floral Saree', 'CHA-512', 'Chanderi', 'Silk Cotton', 'Party Wear', 8900, 5400, 18, 5, ['https://images.unsplash.com/photo-1610030469668-932d568c0780?auto=format&fit=crop&w=800&q=80']),
]


def run():
    Base.metadata.create_all(engine)
    db = SessionLocal()
    if not db.get(User, 'usr-admin-1'):
        db.add(User(id='usr-admin-1', name='Srinath', email='admin@alts.com', password_hash=hash_password('admin123'), role='admin', role_title='Store Director / Manager'))
    if not db.get(User, 'usr-staff-2'):
        db.add(User(id='usr-staff-2', name='Kavitha Ramaswamy', email='staff@alts.com', password_hash=hash_password('staff123'), role='staff', role_title='Senior Sales Executive'))
    for row in SAREES:
        if not db.get(Saree, row[0]):
            db.add(Saree(id=row[0], name=row[1], sku=row[2], category=row[3], fabric=row[4], occasion=row[5], price=Decimal(row[6]), cost_price=Decimal(row[7]), stock=row[8], low_stock_threshold=row[9], images=row[10]))
    if not db.get(Customer, 'cust-1'):
        db.add(Customer(id='cust-1', name='Priya Menon', phone='9876543210', email='priya@example.com', city='Chennai'))
    db.commit(); db.close()


if __name__ == '__main__':
    run()
