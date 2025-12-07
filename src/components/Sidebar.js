import React, { useState, useEffect, useContext } from 'react';
import '../styles/Sidebar.css';
import AuthContext from '../contexts/AuthContext';

const Sidebar = ({ onMenuClick, activeMenu: propActiveMenu }) => {
  const [activeMenu, setActiveMenu] = useState(propActiveMenu || 'Dashboard');

  const { user } = useContext(AuthContext);
  const isManager = user && user.role === 'Manager';

  const menuItems = isManager
    ? [
        { id: 'Dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'Recipe', label: 'Recipe', icon: '👨‍🍳' },
        { id: 'Inventory', label: 'Inventory', icon: '📦' },
        { id: 'Staff', label: 'Staff', icon: '👥' },
      ]
    : [
        { id: 'Staff', label: 'Staff', icon: '👥' },
      ];

  // Update internal state when prop changes
  useEffect(() => {
    if (propActiveMenu) {
      setActiveMenu(propActiveMenu);
    }
  }, [propActiveMenu]);

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (onMenuClick) {
      onMenuClick(menuId);
    }
  };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-container">
          <img 
            src="/assets/logo.png" 
            alt="Green Logo" 
            className="logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="logo-fallback">
            <span>GREEN</span>
            <div className="logo-dot dot-1"></div>
            <div className="logo-dot dot-2"></div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div 
            key={item.id}
            className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;