import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Profile.css';
import '../styles/ShiftView.css';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Schedule state for profile (monthly view for this employee)
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [scheduleData, setScheduleData] = useState({});
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
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

  // Fetch schedules for this employee when profile is available or month/year changes
  const fetchEmployeeSchedule = useCallback(async () => {
    if (!profileData) return;
    setScheduleLoading(true);
    setScheduleError(null);

    try {
      const token = localStorage.getItem('staffToken');
      if (!token) throw new Error('No staff authentication token found');

      const employeeId = profileData.staff_id || profileData.id;
      const response = await fetch(
        `https://greedible-backend.vercel.app/api/schedules/employee?employeeId=${employeeId}&month=${selectedMonth}&year=${selectedYear}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Failed to fetch schedules: ${response.status}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.schedules)) {
        // Group by day of month
        const grouped = data.schedules.reduce((acc, s) => {
          const d = new Date(s.shift_date);
          const day = d.getDate();
          if (!acc[day]) acc[day] = [];
          acc[day].push(s);
          return acc;
        }, {});
        setScheduleData(grouped);
      } else {
        setScheduleData({});
      }
    } catch (err) {
      setScheduleError(err.message || 'Failed to load schedules');
    } finally {
      setScheduleLoading(false);
    }
  }, [profileData, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchEmployeeSchedule();
  }, [fetchEmployeeSchedule]);

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
        {/* Left Column: Schedule */}
        <div className="profile-left-column">
          {/* Schedule Section (monthly calendar for this employee) */}
          <div className="profile-section">
            <h3 className="profile-section-title">Schedule</h3>

            <div className="month-navigation" style={{ marginBottom: 12 }}>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = today.getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            {scheduleLoading ? (
              <div className="loading-message">Loading schedule...</div>
            ) : scheduleError ? (
              <div className="error-message">{scheduleError}</div>
            ) : (
              <div className="shift-calendar">
                <div className="calendar-grid">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <div key={d} className="day-header">
                      {d}
                    </div>
                  ))}

                  {/* empty cells before month start (Monday-based) */}
                  {Array.from({ length: (new Date(selectedYear, selectedMonth - 1, 1).getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`empty-${i}`} className="day-cell empty" />
                  ))}

                  {/* Month dates */}
                  {Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, idx) => {
                    const dateNum = idx + 1;
                    const daySchedules = scheduleData[dateNum] || [];

                    return (
                      <div key={dateNum} className="day-cell">
                        <div className="day-number">{dateNum}/{selectedMonth}/{selectedYear}</div>

                        {daySchedules.length === 0 ? (
                          <div className="no-shifts full-day">No shifts</div>
                        ) : (
                          <div className="shift-slots">
                            {daySchedules.map((s) => (
                              <div key={s.schedule_id} className="shift-block">
                                <div className="shift-time">{s.shift}</div>
                                <div className="shift-count">Assigned</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Personal Info and Salary */}
        <div className="profile-right-column">
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
    </div>
  );
};

export default Profile;
