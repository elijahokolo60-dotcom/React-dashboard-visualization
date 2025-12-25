# backend/routes.py
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from .database import db, Sales, Metrics, UserActivity
import json

api = Blueprint('api', __name__)

@api.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@api.route('/api/metrics/summary', methods=['GET'])
def get_metrics_summary():
    """Get summary metrics for dashboard"""
    latest_metric = Metrics.query.order_by(Metrics.metric_date.desc()).first()
    
    if not latest_metric:
        return jsonify({'error': 'No metrics found'}), 404
    
    # Calculate growth percentages
    previous_metric = Metrics.query.order_by(Metrics.metric_date.desc()).offset(1).first()
    
    response = {
        'total_revenue': {
            'value': latest_metric.total_revenue,
            'change': calculate_change(latest_metric.total_revenue, previous_metric.total_revenue if previous_metric else None)
        },
        'active_users': {
            'value': latest_metric.active_users,
            'change': calculate_change(latest_metric.active_users, previous_metric.active_users if previous_metric else None)
        },
        'conversion_rate': {
            'value': latest_metric.conversion_rate,
            'change': calculate_change(latest_metric.conversion_rate, previous_metric.conversion_rate if previous_metric else None)
        },
        'avg_session_duration': {
            'value': latest_metric.avg_session_duration,
            'change': calculate_change(latest_metric.avg_session_duration, previous_metric.avg_session_duration if previous_metric else None)
        },
        'bounce_rate': {
            'value': latest_metric.bounce_rate,
            'change': calculate_change(latest_metric.bounce_rate, previous_metric.bounce_rate if previous_metric else None)
        }
    }
    
    return jsonify(response)

@api.route('/api/sales/trend', methods=['GET'])
def get_sales_trend():
    """Get sales data for line chart"""
    days = int(request.args.get('days', 7))
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    sales_data = Sales.query.filter(
        Sales.date >= start_date,
        Sales.date <= end_date
    ).order_by(Sales.date).all()
    
    # Group by date
    grouped_sales = {}
    for sale in sales_data:
        date_str = sale.date.strftime('%Y-%m-%d')
        grouped_sales[date_str] = grouped_sales.get(date_str, 0) + sale.amount
    
    dates = sorted(grouped_sales.keys())
    amounts = [grouped_sales[date] for date in dates]
    
    return jsonify({
        'labels': dates,
        'datasets': [{
            'data': amounts,
            'label': 'Daily Sales'
        }]
    })

@api.route('/api/users/device-distribution', methods=['GET'])
def get_device_distribution():
    """Get device distribution for pie chart"""
    device_counts = db.session.query(
        UserActivity.device,
        db.func.count(UserActivity.id)
    ).group_by(UserActivity.device).all()
    
    devices = [device for device, _ in device_counts]
    counts = [count for _, count in device_counts]
    
    colors = {
        'mobile': '#FF6384',
        'desktop': '#36A2EB',
        'tablet': '#FFCE56',
        'other': '#4BC0C0'
    }
    
    data = []
    for i, device in enumerate(devices):
        data.append({
            'name': device.capitalize(),
            'value': counts[i],
            'color': colors.get(device, '#999999'),
            'legendFontColor': '#7F7F7F',
            'legendFontSize': 12
        })
    
    return jsonify(data)

@api.route('/api/regional-sales', methods=['GET'])
def get_regional_sales():
    """Get regional sales for bar chart"""
    regional_sales = db.session.query(
        Sales.region,
        db.func.sum(Sales.amount)
    ).group_by(Sales.region).all()
    
    regions = [region for region, _ in regional_sales]
    amounts = [amount for _, amount in regional_sales]
    
    return jsonify({
        'labels': regions,
        'datasets': [{
            'data': amounts,
            'label': 'Sales by Region'
        }]
    })

@api.route('/api/category-performance', methods=['GET'])
def get_category_performance():
    """Get category performance for stacked bar chart"""
    category_sales = db.session.query(
        Sales.category,
        db.func.sum(Sales.amount)
    ).group_by(Sales.category).all()
    
    categories = [category for category, _ in category_sales]
    amounts = [amount for _, amount in category_sales]
    
    return jsonify({
        'labels': categories,
        'datasets': [{
            'data': amounts,
            'label': 'Sales by Category'
        }]
    })

@api.route('/api/realtime-activity', methods=['GET'])
def get_realtime_activity():
    """Get recent user activity"""
    recent_activity = UserActivity.query.order_by(
        UserActivity.timestamp.desc()
    ).limit(10).all()
    
    activity_list = []
    for activity in recent_activity:
        activity_list.append({
            'id': activity.id,
            'user_id': activity.user_id,
            'action': activity.action,
            'device': activity.device,
            'session_duration': activity.session_duration,
            'timestamp': activity.timestamp.isoformat() if activity.timestamp else None
        })
    
    return jsonify(activity_list)

@api.route('/api/metrics/historical', methods=['GET'])
def get_historical_metrics():
    """Get historical metrics for time series"""
    days = int(request.args.get('days', 30))
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    metrics = Metrics.query.filter(
        Metrics.metric_date >= start_date,
        Metrics.metric_date <= end_date
    ).order_by(Metrics.metric_date).all()
    
    dates = [m.metric_date.strftime('%Y-%m-%d') for m in metrics]
    revenue = [m.total_revenue for m in metrics]
    users = [m.active_users for m in metrics]
    conversion = [m.conversion_rate for m in metrics]
    
    return jsonify({
        'dates': dates,
        'revenue': revenue,
        'active_users': users,
        'conversion_rate': conversion
    })

def calculate_change(current, previous):
    """Calculate percentage change"""
    if not previous or previous == 0:
        return 0
    return round(((current - previous) / previous) * 100, 1)

@api.route('/api/sales/add', methods=['POST'])
def add_sale():
    """Add new sale record"""
    try:
        data = request.get_json()
        
        new_sale = Sales(
            date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
            amount=float(data['amount']),
            product=data.get('product', 'Unknown'),
            region=data.get('region', 'Unknown'),
            category=data.get('category', 'Other')
        )
        
        db.session.add(new_sale)
        db.session.commit()
        
        # Update metrics
        update_metrics()
        
        return jsonify({'success': True, 'id': new_sale.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def update_metrics():
    """Update metrics based on recent data"""
    today = datetime.now().date()
    
    # Calculate today's metrics
    today_sales = Sales.query.filter(Sales.date == today).all()
    total_revenue = sum(sale.amount for sale in today_sales)
    
    # Check if metrics exist for today
    existing_metric = Metrics.query.filter(Metrics.metric_date == today).first()
    
    if existing_metric:
        existing_metric.total_revenue = total_revenue
    else:
        # Create new metric entry
        new_metric = Metrics(
            metric_date=today,
            total_revenue=total_revenue,
            active_users=UserActivity.query.filter(
                db.func.date(UserActivity.timestamp) == today
            ).count(),
            conversion_rate=3.2,  # Simplified calculation
            avg_session_duration=4.5,
            bounce_rate=32.1
        )
        db.session.add(new_metric)
    
    db.session.commit()