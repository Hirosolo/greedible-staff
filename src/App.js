import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RecipePage from './pages/RecipePage';
import StaffPage from './pages/StaffPage';
import InventoryPage from './pages/InventoryPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  // If not authenticated, redirect to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  // If not manager and not on /staff, redirect to /staff
  const isManager = user?.role === 'Manager';
  const currentPath = window.location.pathname;
  if (!isManager && currentPath !== '/staff') {
    return <Navigate to="/staff" replace />;
  }
  return children;
};

// For manager-only pages
const ProtectedManagerRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'Manager') return <Navigate to="/staff" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedManagerRoute>
                <DashboardPage />
              </ProtectedManagerRoute>
            } 
          />
          <Route 
            path="/recipe" 
            element={
              <ProtectedManagerRoute>
                <RecipePage />
              </ProtectedManagerRoute>
            } 
          />
          <Route 
  path="/inventory" 
  element={
    <ProtectedManagerRoute>
      <InventoryPage />
    </ProtectedManagerRoute>
  } 
/>
          <Route 
  path="/staff" 
  element={
    <ProtectedRoute>
      <StaffPage />
    </ProtectedRoute>
  } 
/>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;