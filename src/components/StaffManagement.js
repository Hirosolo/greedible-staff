import React, { useState, useEffect } from 'react';
import '../styles/StaffManagement.css'; // Assuming a new CSS file

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('staffToken'); // Retrieve staff token
        if (!token) {
          throw new Error('No staff authentication token found');
        }

        console.log('Fetching staff data...');
        const response = await fetch('https://greedible-backend-staff.vercel.app/api/staff/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch staff data: ${response.status}`);
        }

        const data = await response.json();
        console.log('Staff data fetched:', data);

        if (data.success && data.staff) {
          setStaff(data.staff);
        } else {
          setStaff([]); // Clear data on error or if no staff are returned
        }
      } catch (err) {
        console.error('Error fetching staff data:', err);
        setError('Failed to load staff data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []); // Fetch staff data on component mount

  if (loading) {
    return <div className="loading-message">Loading staff data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="staff-management-container">
      <h2>Staff Management</h2>
      <table className="staff-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.staff_id}>
              <td>{member.staff_id}</td>
              <td>{member.staff_name}</td>
              <td>{member.staff_email}</td>
              <td>{member.role}</td>
              <td>{member.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {staff.length === 0 && !loading && !error && (
        <div className="no-results">
          No staff members available.
        </div>
      )}
    </div>
  );
};

export default StaffManagement; 