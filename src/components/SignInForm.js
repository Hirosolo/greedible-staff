import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/SignInForm.css';

const SignInForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [rememberPassword, setRememberPassword] = useState(false);

  const { login, loading } = useAuth();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect to Dashboard
      if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
      // Or use React Router
      // navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    alert('Forgot password feature will be implemented soon!');
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-form">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-placeholder">
            <img 
              src="./assets/logo.png" 
              alt="Green Logo" 
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="welcome-text">Welcome back, our GREEN!</h2>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Input */}
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Enter your name here..."
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="form-input"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="form-input"
              disabled={loading}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;