# backend/app.py
from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure CORS for React Native development
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://localhost:8081",  # React Native dev server
                "exp://*",  # Expo
                "http://*",  # All HTTP (for development only)
                "https://*"  # All HTTPS (for development only)
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Database configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dashboard-secret-key')
    
    # Initialize database
    from database import db, init_database
    db.init_app(app)
    
    # Create tables and seed data
    with app.app_context():
        db.create_all()
        init_database()
    
    # Register blueprints
    from routes import api
    app.register_blueprint(api)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("Starting Dashboard API Server...")
    print(f"API Base URL: http://localhost:5000")
    print(f"API Endpoints:")
    print(f"  GET  /api/health")
    print(f"  GET  /api/metrics/summary")
    print(f"  GET  /api/sales/trend")
    print(f"  GET  /api/users/device-distribution")
    print(f"  GET  /api/regional-sales")
    print(f"  POST /api/sales/add")
    app.run(host='0.0.0.0', port=5000, debug=True)