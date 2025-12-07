import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="user-info">
          <div className="user-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
          <div className="user-details">
            <div className="user-name">{user?.name || user?.staff_name || user?.email || 'User'}</div>
            <div className="user-role">{user?.role || 'Admin'}</div>
          </div>
        </div>
      </div>
      
      <div className="navbar-right">
        <div className="navbar-date">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
        <button className="logout-btn delete-btn" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </div>
  );
};

export default Navbar;