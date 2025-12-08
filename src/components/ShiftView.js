import React, { useState, useEffect, useContext } from 'react';
// import DatePicker from 'react-datepicker'; // Import DatePicker component
// import { setDate, startOfWeek } from 'date-fns'; // Import date-fns helpers
// import 'react-datepicker/dist/react-datepicker.css'; // Import date picker CSS
import '../styles/ShiftView.css';
import ShiftDetail from './ShiftDetail'; // Make sure ShiftDetail is imported
import { useAuth } from '../contexts/AuthContext';

// Helper to format date as YYYY-MM-DD (consistent with backend expectation)
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ShiftView = ({ onShiftClick, scheduleRefreshTrigger }) => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(() => {
    // Initialize to the start of the current week (Sunday)
    const today = new Date();
    // Use built-in Date methods instead of date-fns startOfWeek
    const dayOfWeek = today.getDay(); // 0 for Sunday, 6 for Saturday
    const diff = today.getDate() - dayOfWeek; // Difference to get to Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0); // Set time to beginning of the day
    return startOfWeek;
  });
  const [scheduleData, setScheduleData] = useState({}); // State to store fetched schedule data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShiftDetailModal, setShowShiftDetailModal] = useState(false);
  const [selectedShiftForDetail, setSelectedShiftForDetail] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newShiftDate, setNewShiftDate] = useState('');
  const [newShiftType, setNewShiftType] = useState('morning');
  const [notificationMessage, setNotificationMessage] = useState('');

  // Effect to fetch shift data when currentWeek or scheduleRefreshTrigger changes
  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('staffToken'); // Retrieve staff token
        if (!token) {
          throw new Error('No staff authentication token found');
        }

        const startDateString = formatDate(currentWeek); // Format the start date
        console.log('Fetching schedule for week starting:', startDateString);

        const response = await fetch(`https://greedible-backend-staff.vercel.app/api/schedules/week?startDate=${startDateString}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch schedule data: ${response.status}`);
        }

        const data = await response.json();
        console.log('Schedule data fetched:', data);

        if (data.success && data.schedule) {
            // Transform the fetched array data into an object grouped by date for easier rendering
            const groupedSchedule = data.schedule.reduce((acc, dayData) => {
                acc[dayData.date] = dayData.shifts;
                return acc;
            }, {});
            setScheduleData(groupedSchedule);
        } else {
          setScheduleData({}); // Clear data if not successful or no schedule returned
        }

      } catch (err) {
        console.error('Error fetching schedule data:', err);
        setError('Failed to load schedule data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();

  }, [currentWeek, scheduleRefreshTrigger]); // Re-fetch when currentWeek or trigger changes

  // Calculate dates for the current week dynamically
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(currentWeek.getDate() + i);
    return {
        date: date.getDate(), // Day of the month (e.g., 23)
        dayOfWeek: date.getDay(), // 0-6 (Sun-Sat)
        fullDate: date // Full Date object for potential use
    };
  });

  const weekDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleShiftClickInternal = (date, shift) => {
    // Calculate the full date for the shift
    const shiftFullDate = new Date(currentWeek);
    const dayIndex = weekDates.findIndex(d => d.date === date);
    shiftFullDate.setDate(currentWeek.getDate() + dayIndex);
    
    setSelectedShiftForDetail({ 
      date: date, 
      fullDate: shiftFullDate, // Add full date object
      ...shift 
    });
    setShowShiftDetailModal(true);
  };

  const handleCloseShiftDetailModal = () => {
    setShowShiftDetailModal(false);
    setSelectedShiftForDetail(null);
  };

  const handleAddShiftClick = () => {
    setShowDatePicker(true); // Show date picker first
  };

  const handleDatePickerChange = (e) => {
    setNewShiftDate(e.target.value);
  };

  const handleShiftTypeChange = (e) => {
    setNewShiftType(e.target.value);
  };

  const handleDatePickerConfirm = async () => {
    if (!newShiftDate || !newShiftType) return;
    // Create a new shift for the selected date and type
    try {
      const token = localStorage.getItem('staffToken');
      if (!token) throw new Error('No staff authentication token found');
      const response = await fetch('https://greedible-backend-staff.vercel.app/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shift_date: newShiftDate, shift: newShiftType }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create shift');
      }
      // Refresh schedule after creation
      if (scheduleRefreshTrigger) scheduleRefreshTrigger();
    } catch (err) {
      setNotificationMessage('Failed to create shift: ' + err.message);
      setTimeout(() => setNotificationMessage(''), 4000);
    } finally {
      setShowDatePicker(false);
      setNewShiftDate('');
      setNewShiftType('morning');
    }
  };

  const handleDatePickerCancel = () => {
    setShowDatePicker(false);
    setNewShiftDate('');
    setNewShiftType('morning');
  };

  const handlePrevWeek = () => {
    const prevWeekStart = new Date(currentWeek);
    prevWeekStart.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(prevWeekStart);
  };

  const handleNextWeek = () => {
    const nextWeekStart = new Date(currentWeek);
    nextWeekStart.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(nextWeekStart);
  };

   if (loading) {
    return <div className="loading-message">Loading schedule...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="shift-view">
      {notificationMessage && (
        <div className="error-message" style={{marginBottom: '16px'}}>{notificationMessage}</div>
      )}
      <div className="shift-header">
        <h2 className="shift-title">Shift View</h2>
        <div className="week-navigation">
          <button className="nav-btn" onClick={handlePrevWeek}>‹</button>
          {/* Display current week range */}
          <span className="week-range">
             {/* Display the start and end dates in a more readable format */}
            {`${currentWeek.toLocaleString('default', { month: 'short' })} ${currentWeek.getDate()} - ${weekDates[6].fullDate.toLocaleString('default', { month: 'short' })} ${weekDates[6].fullDate.getDate()}, ${currentWeek.getFullYear()}`}
          </span>
          <button className="nav-btn" onClick={handleNextWeek}>›</button>
          {user?.role === 'Manager' && (
            <button className="add-shift-btn" onClick={handleAddShiftClick}>Add Shift</button>
          )}
        </div>
      </div>

      <div className="shift-calendar">
        <div className="calendar-grid">
          {/* Header Row (Day Names) */}
          {weekDayNames.map((dayName) => (
            <div key={dayName} className="day-header">{dayName}</div>
          ))}

          {/* Date and Shifts Row */}
          {weekDates.map(({ date, dayOfWeek, fullDate }) => (
            <div key={date} className="day-cell">
              {/* Display the full date in the existing day-number div */}
              <div className="day-number">{`${fullDate.getDate()}/${fullDate.getMonth() + 1}/${fullDate.getFullYear()}`}</div>
              
              {/* Shifts for this day from fetched data */}
              {scheduleData[date] && scheduleData[date].map((shift) => (
                <div 
                  key={shift.id} // Using the unique shift block ID from backend
                  className="shift-block"
                  onClick={() => handleShiftClickInternal(date, shift)} // Pass day of month and shift data
                >
                  <div className="shift-time">{shift.time}</div>
                  <div className="shift-count">{shift.staff.length} staff</div>
                  <div className="staff-avatars">
                    {/* Map over staff members in the fetched shift data */}
                    {shift.staff.slice(0, 5).map((person, personIndex) => (
                      <div 
                        key={person.id || person.staff_id || personIndex} // Use staff id or index as key
                        className="staff-avatar"
                        style={{ backgroundColor: person.color || '#CCCCCC' }} // Use fetched color or default
                        title={person.name}
                      >
                         {/* Display first initial or avatar based on available data */}
                        {person.avatar || person.name.charAt(0)}
                      </div>
                    ))}
                    {shift.staff.length > 5 && (
                      <div className="staff-avatar more">
                        +{shift.staff.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              ))}

               {/* Display message if no shifts for the day */}
               {!scheduleData[date] && !loading && <div className="no-shifts">No shifts</div>}

            </div>
          ))}
        </div>
      </div>

      {/* Shift Detail Modal */}
      {/* Date Picker Modal for Adding Shift */}
      {showDatePicker && (
        <div className="modal-overlay">
          <div className="create-shift-modal">
            <h3 className="create-shift-title">Create Shift</h3>
            <label className="create-shift-label">
              Date:
              <input
                type="date"
                value={newShiftDate}
                onChange={handleDatePickerChange}
                className="create-shift-input"
              />
            </label>
            <label className="create-shift-label">
              Shift:
              <select
                value={newShiftType}
                onChange={handleShiftTypeChange}
                className="create-shift-input"
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
              </select>
            </label>
            <div className="create-shift-actions">
              <button className="create-shift-cancel" onClick={handleDatePickerCancel}>Cancel</button>
              <button className="create-shift-confirm" onClick={handleDatePickerConfirm} disabled={!newShiftDate || !newShiftType}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showShiftDetailModal && (
        <div className="modal-overlay">
          <div className="shift-detail-modal">
            <ShiftDetail
              shift={selectedShiftForDetail} // Pass selectedShiftForDetail (null for new shift)
              isNewShift={!selectedShiftForDetail} // True if no shift is selected (new shift)
              onClose={handleCloseShiftDetailModal}
              onShiftUpdate={() => { // Callback after save/delete to refresh schedule
                handleCloseShiftDetailModal();
                if (scheduleRefreshTrigger) scheduleRefreshTrigger(); // Trigger refresh if prop exists
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ShiftView;