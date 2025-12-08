import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateStaffToken } from '../api/authApi';

// Tạo AuthContext
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fake user data
  const VALID_USER = {
    email: 'nhihuynh.960939@gmail.com',
    password: 'Nhi',
    userData: {
      id: 1,
      name: 'Nhi Huynh',
      email: 'nhihuynh.960939@gmail.com',
      role: 'admin'
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('staffToken');
      if (token) {
        try {
          // Validate the token with the backend
          const userData = await validateStaffToken(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          // If token is invalid, remove it from localStorage
          localStorage.removeItem('staffToken');
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    
    try {
      const response = await fetch('https://greedible-backend-staff.vercel.app/api/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Assuming backend returns a message in case of error
        throw new Error(data.message || 'Login failed');
      }

      // Assuming backend returns user data and token on success
      localStorage.setItem('staffToken', data.token); // Store token in localStorage
      setUser(data.user);
      setIsAuthenticated(true);
      setLoading(false);

      return {
        success: true,
        message: 'Login successful!',
        user: data.user,
      };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('staffToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check if user is logged in (for route protection)
  const checkAuth = () => {
    return isAuthenticated && user;
  };

  // Get current user info
  const getCurrentUser = () => {
    return user;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
    getCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && <div>Loading authentication...</div>}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;