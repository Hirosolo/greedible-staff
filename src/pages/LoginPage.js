import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignInForm from '../components/SignInForm';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    console.log('Login successful:', userData);
    navigate('/dashboard'); // Redirect to dashboard
  };

  return (
    <div className="login-page">
      <SignInForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default LoginPage;