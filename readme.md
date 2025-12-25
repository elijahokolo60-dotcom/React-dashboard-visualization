data_dashboard/
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── models.py
│   ├── routes.py
│   ├── requirements.txt
│   └── data.db
└── frontend/
    └── React Native files



    # Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py


 Setup and Running Instructions
For Backend (Python):
bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the Flask server
python app.py
For Frontend (React Native):
bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install react-native-chart-kit react-native-svg react-native-vector-icons

# 3. Start React Native server
npx react-native start

# 4. Run on iOS
npx react-native run-ios

# 5. Run on Android
npx react-native run-android
5. Network Configuration for Physical Device Testing
If testing on a physical device:

Find your computer's IP address:

bash
# Windows:
ipconfig
# Mac/Linux:
ifconfig
Update API_BASE_URL in Dashboard.js:

javascript
// Change from localhost to your computer's IP
const API_BASE_URL = 'http://192.168.1.100:5000'; // Your computer's IP
Allow network access in Flask:

python
# In app.py, ensure host is '0.0.0.0'
app.run(host='0.0.0.0', port=5000, debug=True)
Disable firewall or allow port 5000:

bash
# Windows:
netsh advfirewall firewall add rule name="Flask Port" dir=in action=allow protocol=TCP localport=5000

# Mac:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/python3
6. API Endpoints Summary
Endpoint	Method	Description
/api/health	GET	Health check
/api/metrics/summary	GET	Dashboard metrics
/api/sales/trend?days=7	GET	Sales trend data
/api/users/device-distribution	GET	User device stats
/api/regional-sales	GET	Sales by region
/api/category-performance	GET	Sales by category
/api/realtime-activity	GET	Recent user activity
/api/metrics/historical?days=30	GET	Historical metrics
/api/sales/add	POST	Add new sale
7. Database Schema
The SQLite database (data.db) will contain:

sales table: Sales transactions

user_activity table: User activities

metrics table: Daily aggregated metrics

8. Features of This Implementation
Real API Integration: Fetches data from Python backend

SQLite Database: Persistent data storage

CRUD Operations: Full Create, Read, Update capabilities

Error Handling: Graceful fallback and error messages

Refresh Control: Pull-to-refresh functionality

Loading States: Activity indicators during data fetch

Dynamic Updates: Auto-refresh after adding data

Network Resilience: Works offline with fallback data