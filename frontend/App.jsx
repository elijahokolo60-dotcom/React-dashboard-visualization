// frontend/App.js
import React from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';
import Dashboard from './Dashboard';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Dashboard />
    </SafeAreaView>
  );
}