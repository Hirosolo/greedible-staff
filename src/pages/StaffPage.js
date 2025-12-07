import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Salaries from '../components/Salaries';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ShiftView from '../components/ShiftView';
import ShiftDetail from '../components/ShiftDetail';
import StaffManagement from '../components/StaffManagement';
import '../styles/StaffPage.css';

const StaffPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showShiftDetail, setShowShiftDetail] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [scheduleRefreshTrigger, setScheduleRefreshTrigger] = useState(false);
  const [activeTab, setActiveTab] = useState('shifts');

  const triggerScheduleRefresh = () => {
    console.log('Triggering schedule refresh...');
    setScheduleRefreshTrigger(prev => !prev);
  };

  const getActiveMenu = (pathname) => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/recipe') return 'Recipe';
    if (pathname === '/inventory') return 'Inventory';
    if (pathname === '/staff') return 'Staff';
    if (pathname === '/user') return 'User';
    return 'Staff'; // Default to Staff for this page
  };

  const handleMenuClick = (menuId) => {
    console.log('Navigate to:', menuId);
    
    switch (menuId) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Recipe':
        navigate('/recipe');
        break;
      case 'Inventory':
        navigate('/inventory');
        break;
      case 'User':
        // For now, redirect to dashboard since User page doesn't exist
        navigate('/dashboard');
        break;
      case 'Staff':
      default:
        break;
    }
  };

  const handleShiftClick = (date, shift) => {
    console.log('Shift clicked:', date, shift);
    setSelectedShift({ date: date, ...shift });
    setShowShiftDetail(true);
  };

  const handleCloseShiftDetail = () => {
    setShowShiftDetail(false);
    setSelectedShift(null);
  };

  const handleSaveShift = () => {
    console.log('Save shift:', selectedShift);
    setShowShiftDetail(false);
    setSelectedShift(null);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="staff-page">
      <Sidebar 
        key={location.pathname}
        onMenuClick={handleMenuClick} 
        activeMenu={getActiveMenu(location.pathname)}
      />
      <div className="main-content">
        <Navbar />
        <div className="content-area">
          <div className="staff-content">

            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'shifts' ? 'active' : ''}`}
                onClick={() => handleTabClick('shifts')}
              >
                Shift View
              </button>
              <button 
                className={`tab-button ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => handleTabClick('staff')}
              >
                {user?.role === 'Manager' ? 'Staff Management' : 'Salaries'}
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'shifts' && (
                <div className="shift-management-section">
                  <h2>Shift Schedule</h2>
                  <ShiftView onShiftClick={handleShiftClick} scheduleRefreshTrigger={scheduleRefreshTrigger} />
                </div>
              )}
              {activeTab === 'staff' && (
                user?.role === 'Manager' ? (
                  <div className="staff-list-section" style={{ marginTop: '30px' }}>
                    <h2>All Staff Members</h2>
                    <StaffManagement />
                  </div>
                ) : (
                  <Salaries />
                )
              )}
            </div>

          </div>
        </div>
      </div>

      {showShiftDetail && selectedShift && (
        <div className="modal-overlay">
          <div className="shift-detail-modal">
            <ShiftDetail
              shift={selectedShift}
              onSave={handleSaveShift}
              onClose={handleCloseShiftDetail}
              onShiftUpdate={triggerScheduleRefresh}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;