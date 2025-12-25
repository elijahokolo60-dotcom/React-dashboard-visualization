# backend/database.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Sales(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    product = db.Column(db.String(100))
    region = db.Column(db.String(50))
    category = db.Column(db.String(50))

class UserActivity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer)
    action = db.Column(db.String(50))
    device = db.Column(db.String(50))
    session_duration = db.Column(db.Float)

class Metrics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    metric_date = db.Column(db.Date, nullable=False)
    total_revenue = db.Column(db.Float)
    active_users = db.Column(db.Integer)
    conversion_rate = db.Column(db.Float)
    avg_session_duration = db.Column(db.Float)
    bounce_rate = db.Column(db.Float)
    
def init_database():
    """Initialize database with sample data"""
    db.create_all()
    
    # Add sample data if empty
    if Sales.query.count() == 0:
        sample_sales = [
            Sales(date='2024-01-01', amount=12000, product='Product A', region='North', category='Electronics'),
            Sales(date='2024-01-02', amount=18000, product='Product B', region='South', category='Clothing'),
            Sales(date='2024-01-03', amount=15000, product='Product C', region='East', category='Home'),
            Sales(date='2024-01-04', amount=22000, product='Product A', region='West', category='Electronics'),
            Sales(date='2024-01-05', amount=19000, product='Product B', region='North', category='Clothing'),
            Sales(date='2024-01-06', amount=21000, product='Product C', region='South', category='Home'),
            Sales(date='2024-01-07', amount=25000, product='Product A', region='East', category='Electronics'),
        ]
        db.session.bulk_save_objects(sample_sales)
        
    if Metrics.query.count() == 0:
        sample_metrics = [
            Metrics(metric_date='2024-01-01', total_revenue=125000, active_users=2450, 
                   conversion_rate=3.2, avg_session_duration=4.5, bounce_rate=32.1),
            Metrics(metric_date='2024-01-02', total_revenue=132000, active_users=2510, 
                   conversion_rate=3.4, avg_session_duration=4.7, bounce_rate=31.5),
            Metrics(metric_date='2024-01-03', total_revenue=128000, active_users=2380, 
                   conversion_rate=3.1, avg_session_duration=4.3, bounce_rate=33.2),
        ]
        db.session.bulk_save_objects(sample_metrics)
        
    if UserActivity.query.count() == 0:
        sample_activities = [
            UserActivity(user_id=1, action='login', device='mobile', session_duration=4.5),
            UserActivity(user_id=2, action='purchase', device='desktop', session_duration=6.2),
            UserActivity(user_id=3, action='browse', device='tablet', session_duration=3.1),
            UserActivity(user_id=4, action='login', device='mobile', session_duration=5.0),
            UserActivity(user_id=5, action='purchase', device='desktop', session_duration=7.1),
        ]
        db.session.bulk_save_objects(sample_activities)
    
    db.session.commit()