import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import '../styles/Layout.css';

const Layout = ({ children, onMenuClick }) => {
  return (
    <div className="layout">
      <Sidebar onMenuClick={onMenuClick} />
      <div className="main-content">
        <Navbar />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;