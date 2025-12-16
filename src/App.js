import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
  return children;
};

// For manager/admin-only pages (deprecated - now all authenticated users can access pages)
const ProtectedManagerRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipe" 
            element={
              <ProtectedRoute>
                <RecipePage />
              </ProtectedRoute>
            } 
          />
          <Route 
  path="/inventory" 
  element={
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
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