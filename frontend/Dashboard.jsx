// frontend/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
} from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';

// API Configuration
const API_BASE_URL = 'http://localhost:5000'; // Change to your server IP if needed
// For physical device testing on same network:
// const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // State for API data
  const [metrics, setMetrics] = useState({
    total_revenue: { value: 0, change: 0 },
    active_users: { value: 0, change: 0 },
    conversion_rate: { value: 0, change: 0 },
    avg_session_duration: { value: 0, change: 0 },
    bounce_rate: { value: 0, change: 0 },
  });

  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });

  const [deviceData, setDeviceData] = useState([]);
  const [regionalData, setRegionalData] = useState({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch all data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch metrics summary
      const metricsResponse = await fetch(`${API_BASE_URL}/api/metrics/summary`);
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Fetch sales trend
      const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
      const salesResponse = await fetch(`${API_BASE_URL}/api/sales/trend?days=${days}`);
      const salesData = await salesResponse.json();
      setSalesData(salesData);

      // Fetch device distribution
      const deviceResponse = await fetch(`${API_BASE_URL}/api/users/device-distribution`);
      const deviceData = await deviceResponse.json();
      setDeviceData(deviceData);

      // Fetch regional sales
      const regionalResponse = await fetch(`${API_BASE_URL}/api/regional-sales`);
      const regionalData = await regionalResponse.json();
      setRegionalData(regionalData);

      // Fetch recent activity
      const activityResponse = await fetch(`${API_BASE_URL}/api/realtime-activity`);
      const activityData = await activityResponse.json();
      setRecentActivity(activityData.slice(0, 5)); // Show only 5 most recent

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Make sure the backend server is running.');
      // Set fallback data
      setFallbackData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fallback data in case API fails
  const setFallbackData = () => {
    setMetrics({
      total_revenue: { value: 125000, change: 12.5 },
      active_users: { value: 2450, change: 8.2 },
      conversion_rate: { value: 3.2, change: 0.4 },
      avg_session_duration: { value: 4.5, change: -0.2 },
      bounce_rate: { value: 32.1, change: -1.2 },
    });

    setSalesData({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [20000, 18000, 22000, 25000, 21000, 28000, 30000],
      }],
    });

    setDeviceData([
      { name: 'Mobile', value: 65, color: '#FF6384' },
      { name: 'Desktop', value: 25, color: '#36A2EB' },
      { name: 'Tablet', value: 10, color: '#FFCE56' },
    ]);

    setRegionalData({
      labels: ['North', 'South', 'East', 'West'],
      datasets: [{
        data: [45000, 38000, 42000, 39000],
      }],
    });
  };

  // Add new sale (example function)
  const addSampleSale = async () => {
    try {
      const newSale = {
        date: new Date().toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 5000) + 1000,
        product: ['Product A', 'Product B', 'Product C'][Math.floor(Math.random() * 3)],
        region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
        category: ['Electronics', 'Clothing', 'Home'][Math.floor(Math.random() * 3)],
      };

      const response = await fetch(`${API_BASE_URL}/api/sales/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSale),
      });

      if (response.ok) {
        alert('Sale added successfully!');
        fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Error adding sale:', err);
      alert('Failed to add sale');
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    fetchDashboardData();
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(26, 115, 232, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#1a73e8',
    },
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Analytics Dashboard</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchDashboardData}>
            <MaterialIcons name="refresh" size={24} color="#1a73e8" />
          </TouchableOpacity>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={20} color="#d32f2f" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.timeRangeSelector}>
          {['day', 'week', 'month', 'year'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeButton,
                timeRange === range && styles.timeButtonActive,
              ]}
              onPress={() => handleTimeRangeChange(range)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  timeRange === range && styles.timeButtonTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Metrics Cards */}
      <View style={styles.metricsContainer}>
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.total_revenue.value.toLocaleString()}`}
          change={metrics.total_revenue.change}
          icon="attach-money"
          color="#4CAF50"
        />
        <MetricCard
          title="Active Users"
          value={metrics.active_users.value.toLocaleString()}
          change={metrics.active_users.change}
          icon="people"
          color="#2196F3"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversion_rate.value}%`}
          change={metrics.conversion_rate.change}
          icon="trending-up"
          color="#FF9800"
        />
        <MetricCard
          title="Avg Session"
          value={`${metrics.avg_session_duration.value}m`}
          change={metrics.avg_session_duration.change}
          icon="access-time"
          color="#9C27B0"
        />
      </View>

      {/* Add Sample Data Button */}
      <TouchableOpacity style={styles.addButton} onPress={addSampleSale}>
        <MaterialIcons name="add-circle" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Sample Sale</Text>
      </TouchableOpacity>

      {/* Charts Section */}
      <View style={styles.chartContainer}>
        {/* Sales Trend Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sales Trend ({timeRange})</Text>
          {salesData.datasets[0].data.length > 0 ? (
            <LineChart
              data={salesData}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisLabel="$"
              yAxisSuffix=""
            />
          ) : (
            <Text style={styles.noDataText}>No sales data available</Text>
          )}
        </View>

        <View style={styles.row}>
          {/* Device Distribution */}
          <View style={[styles.chartCard, styles.halfCard]}>
            <Text style={styles.chartTitle}>User Devices</Text>
            {deviceData.length > 0 ? (
              <PieChart
                data={deviceData}
                width={Dimensions.get('window').width / 2 - 24}
                height={150}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
              />
            ) : (
              <Text style={styles.noDataText}>No device data</Text>
            )}
          </View>

          {/* Regional Sales */}
          <View style={[styles.chartCard, styles.halfCard]}>
            <Text style={styles.chartTitle}>Regional Sales</Text>
            {regionalData.datasets[0].data.length > 0 ? (
              <BarChart
                data={regionalData}
                width={Dimensions.get('window').width / 2 - 24}
                height={150}
                chartConfig={chartConfig}
                showValuesOnTopOfBars
                style={styles.chart}
                yAxisLabel="$"
              />
            ) : (
              <Text style={styles.noDataText}>No regional data</Text>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Recent Activity</Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <MaterialIcons
                    name={
                      activity.action === 'purchase' ? 'shopping-cart' :
                      activity.action === 'login' ? 'login' : 'visibility'
                    }
                    size={20}
                    color="#666"
                  />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityText}>
                    User #{activity.user_id} {activity.action} on {activity.device}
                  </Text>
                  <Text style={styles.activityTime}>
                    {activity.session_duration} min session
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No recent activity</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon, color }) => (
  <View style={styles.metricCard}>
    <View style={styles.metricHeader}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text
        style={[
          styles.changeText,
          { color: change > 0 ? '#4CAF50' : change < 0 ? '#F44336' : '#666' },
        ]}
      >
        {change > 0 ? '+' : ''}{change}%
      </Text>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 8,
    flex: 1,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timeButtonActive: {
    backgroundColor: '#1a73e8',
  },
  timeButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  timeButtonTextActive: {
    color: '#fff',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1a73e8',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  chartContainer: {
    padding: 16,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCard: {
    width: '48%',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
    fontStyle: 'italic',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default Dashboard;