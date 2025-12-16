import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('staffToken');
        if (!token) {
          throw new Error('No staff authentication token found');
        }

        // Fetch profile data from /api/staff/me
        const profileResponse = await fetch(
          'https://greedible-backend.vercel.app/api/staff/me',
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error(`Failed to fetch profile: ${profileResponse.status}`);
        }

        const profileResult = await profileResponse.json();
        setProfileData(profileResult);

        // Fetch salary data from /api/staff/salary
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        
        const salaryResponse = await fetch(
          `https://greedible-backend.vercel.app/api/staff/salary?month=${month}&year=${year}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!salaryResponse.ok) {
          throw new Error(`Failed to fetch salary: ${salaryResponse.status}`);
        }

        const salaryResult = await salaryResponse.json();
        setSalaryData(salaryResult);
      } catch (err) {
        setError(err.message || 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const formatCurrency = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return amount;
    return numAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">Profile</h2>
      
      <div className="profile-content">
        {/* Profile Information Section */}
        <div className="profile-section">
          <h3 className="profile-section-title">Personal Information</h3>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-label">ID:</span>
              <span className="profile-info-value">{profileData?.staff_id || profileData?.id || 'N/A'}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Name:</span>
              <span className="profile-info-value">{profileData?.staff_name || profileData?.name || 'N/A'}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Email:</span>
              <span className="profile-info-value">{profileData?.staff_email || profileData?.email || 'N/A'}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-label">Role:</span>
              <span className="profile-info-value">{profileData?.role || 'N/A'}</span>
            </div>
            {profileData?.phone && (
              <div className="profile-info-item">
                <span className="profile-info-label">Phone:</span>
                <span className="profile-info-value">{profileData.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Salary Information Section */}
        <div className="profile-section">
          <h3 className="profile-section-title">Salary Information</h3>
          <div className="profile-salary-grid">
            <div className="profile-salary-item">
              <span className="profile-salary-label">Working Hours:</span>
              <span className="profile-salary-value">{salaryData?.hours || 0}</span>
            </div>
            <div className="profile-salary-item">
              <span className="profile-salary-label">Salary:</span>
              <span className="profile-salary-value">{formatCurrency(salaryData?.salary || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
