import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Salaries = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ hours: 0, salary: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalaryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('staffToken');
        const now = new Date();
        const month = now.getMonth() + 1; // JS months are 0-based
        const year = now.getFullYear();
        const response = await fetch(`https://greedible-backend-staff.vercel.app/api/staff/salary?month=${month}&year=${year}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch salary data');
        const result = await response.json();
        setData({ hours: result.hours, salary: result.salary });
      } catch (err) {
        setError('Could not load salary data.');
      } finally {
        setLoading(false);
      }
    };
    fetchSalaryData();
  }, [user]);

  if (loading) return <div>Loading salary data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ marginTop: '30px' }}>
      <h2>Your Salary for This Month</h2>
      <table style={{ width: '100%', maxWidth: 400, margin: '20px auto', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ fontWeight: 'bold', padding: '8px' }}>Working Hours</td>
            <td style={{ padding: '8px' }}>{data.hours}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold', padding: '8px' }}>Salary</td>
            <td style={{ padding: '8px' }}>{data.salary.toLocaleString('en-US', { style: 'currency', currency: 'VND' })}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Salaries;
