import React, { useState, useEffect, useContext } from 'react';
import '../styles/ShiftDetail.css';
import AuthContext from '../contexts/AuthContext';

// Helper function to format date as YYYY-MM-DD (consistent with backend expectation)
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// API calls for removing and adding staff to shifts
const removeStaffFromShiftAPI = async (scheduleId, token) => {
  const response = await fetch(`https://greedible-backend.vercel.app/api/schedules/${scheduleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove staff from shift');
  }
  return response.json();
};

const addStaffToShiftAPI = async (shiftData, token) => {
  const response = await fetch('https://greedible-backend.vercel.app/api/schedules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(shiftData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add staff to shift');
  }
  return response.json();
};

const createShiftAPI = async (shiftData, token) => {
  const response = await fetch('https://greedible-backend.vercel.app/api/schedules', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(shiftData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create shift');
  }
  return response.json();
};

const deleteShiftAPI = async (scheduleId, token) => {
  const response = await fetch(`https://greedible-backend.vercel.app/api/schedules/${scheduleId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete shift');
  }
  return response.json();
};

const fetchAllStaff = async (token) => {
   const response = await fetch('https://greedible-backend.vercel.app/api/staff/all', {
     headers: {
       'Authorization': `Bearer ${token}`,
     },
   });
   if (!response.ok) {
     const error = await response.json();
     throw new Error(error.message || 'Failed to fetch staff list');
   }
   const data = await response.json();
   if (data.success && data.staff) {
     return data.staff;
   } else {
     return [];
   }
};

const ShiftDetail = ({ shift, onClose, onShiftUpdate, isNewShift }) => {
  const { user } = useContext(AuthContext);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // No need to load available staff or manage add/remove logic for this UI
  // Only need to show current staff and allow current user to sign up/un-assign
  // For new shift, just show info (no sign up for new shift modal)

  // Remove add/remove staff logic

  // Sign up or un-assign logic for current user
  const handleSignUp = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    const token = localStorage.getItem('staffToken');
    if (!token) {
      setSaveError('No staff authentication token found');
      setIsSaving(false);
      return;
    }
    // Debug log
    const shiftDateFormatted = shift?.fullDate ? formatDate(shift.fullDate) : null;
    const shiftType = shift?.shift;
    // Debug output
    console.log('DEBUG: shift:', shift);
    console.log('DEBUG: shift.fullDate:', shift?.fullDate);
    console.log('DEBUG: shift.shift:', shift?.shift);
    console.log('DEBUG: user.id:', user?.id);
    console.log('DEBUG: sign up payload:', { shift_date: shiftDateFormatted, shift: shiftType, staff_id: user?.id });
    const staffIdToSend = user?.id || user?.staff_id;
    if (!shiftDateFormatted || !shiftType || !staffIdToSend) {
      setSaveError('Shift date, shift time, and staff ID are required.');
      setIsSaving(false);
      return;
    }
    try {
      await addStaffToShiftAPI({
        shift_date: shiftDateFormatted,
        shift: shiftType,
        staff_id: staffIdToSend,
      }, token);
      if (onShiftUpdate) onShiftUpdate();
      onClose();
    } catch (err) {
      setSaveError(`Failed to sign up: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnassign = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    const token = localStorage.getItem('staffToken');
    if (!token) {
      setSaveError('No staff authentication token found');
      setIsSaving(false);
      return;
    }
    try {
      // Find the schedule_id for the current user in this shift
      const person = shift.staff.find(
        p => (p.id === user.id || p.staff_id === user.id)
      );
      if (!person || !person.schedule_id) {
        setSaveError('Could not find your assignment in this shift.');
        setIsSaving(false);
        return;
      }
      await removeStaffFromShiftAPI(person.schedule_id, token);
      if (onShiftUpdate) onShiftUpdate();
      onClose();
    } catch (err) {
      setSaveError(`Failed to un-assign: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Remove delete shift logic for staff self-service

  // Just show the staff list for this shift
  const staffList = shift && shift.staff ? shift.staff : [];
  // Robustly check if user is signed up (compare all possible id fields as strings)
  const userIdStr = user ? String(user.id || user.staff_id) : '';
  const isUserSignedUp = user && staffList.some(p => {
    const staffIdStr = String(p.staff_id || p.id);
    return staffIdStr === userIdStr;
  });
  // Debug log
  // console.log('userIdStr:', userIdStr, 'staffList:', staffList.map(p => p.staff_id || p.id));

  // Manager delete shift logic
  const handleDeleteShift = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    const token = localStorage.getItem('staffToken');
    if (!token) {
      setSaveError('No staff authentication token found');
      setIsSaving(false);
      return;
    }
    try {
      // For manager: delete all assignments for this shift (date+type)
      const shiftDate = shift?.fullDate ? (typeof shift.fullDate === 'string' ? shift.fullDate : shift.fullDate.toISOString().slice(0, 10)) : null;
      const shiftType = shift?.shift || shift?.time || 'Morning';
      if (!shiftDate || !shiftType) {
        setSaveError('No shift date or type found for this shift.');
        setIsSaving(false);
        return;
      }
      const response = await fetch('https://greedible-backend.vercel.app/api/schedules/block', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ shift_date: shiftDate, shift: shiftType }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete shift');
      }
      if (onShiftUpdate) onShiftUpdate();
      onClose();
    } catch (err) {
      setSaveError(`Failed to delete shift: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="shift-detail">
      <div className="shift-detail-header">
        <h3 className="shift-detail-title">Shift Details</h3>
        <div className="header-buttons">
          <button className="close-btn" onClick={onClose} disabled={isSaving}>×</button>
        </div>
      </div>
      <div className="shift-time-display">
        {shift?.fullDate ? `${shift.fullDate.toLocaleDateString()} - ${shift?.time || 'N/A'}` : 'N/A'}
      </div>
      {saveError && <div className="error-message">{saveError}</div>}
      <div className="staff-list">
        <h4>Staff in this shift:</h4>
        {staffList.length > 0 ? (
          staffList.map((person) => (
            <div key={person.id || person.staff_id} className="staff-item">
              <div className="staff-info">
                <div className="staff-avatar-container">
                  <img 
                    src={person.avatar} 
                    alt={person.name || person.staff_name}
                    className="staff-photo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                    style={{ display: person.avatar ? '' : 'none' }}
                  />
                  <div 
                    className="staff-avatar-fallback"
                    style={{ 
                      backgroundColor: person.color || '#CCCCCC',
                      display: person.avatar ? 'none' : 'flex'
                    }}
                  >
                    {(person.name || person.staff_name) ? (person.name || person.staff_name).charAt(0) : '?'}
                  </div>
                </div>
                <div className="staff-details">
                  <div className="staff-name">
                    {person.name || person.staff_name}
                  </div>
                  <div className="staff-position">{person.role}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No staff assigned to this shift.</p>
        )}
      </div>
      <div className="shift-actions">
        {user?.role === 'Manager' && (
          <button className="save-shift-btn delete-btn" onClick={handleDeleteShift} disabled={isSaving} style={{ marginBottom: 8 }}>
            {isSaving ? 'Processing...' : 'Delete Shift'}
          </button>
        )}
        {isUserSignedUp ? (
          <button className="save-shift-btn delete-btn" onClick={handleUnassign} disabled={isSaving}>
            {isSaving ? 'Processing...' : 'Un-assign from this shift'}
          </button>
        ) : (
          <button className="save-shift-btn" onClick={handleSignUp} disabled={isSaving}>
            {isSaving ? 'Processing...' : 'Sign up for this shift'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ShiftDetail;