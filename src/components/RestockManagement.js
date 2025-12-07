import React, { useState, useEffect } from 'react';
import '../styles/RestockManagement.css';

const RestockManagement = ({ onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [restockOrders, setRestockOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestockOrders = async () => {
      try {
        const token = localStorage.getItem('staffToken');
        if (!token) {
          throw new Error('No staff authentication token found');
        }

        const response = await fetch('https://greedible-backend.vercel.app/api/restocks', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch restock orders');
        }
        const data = await response.json();
        console.log('Fetched restock orders data:', data);
        setRestockOrders(data.restocks);
      } catch (err) {
        console.error('Error fetching restock orders:', err);
        setError('Failed to load restock orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestockOrders();
  }, []);
  
  const filteredOrders = restockOrders.filter(order =>
    order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.restock_date && new Date(order.restock_date).toLocaleDateString().includes(searchTerm))
  );

  const handleViewDetails = (order) => {
    if (onViewDetails) {
      onViewDetails(order);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading restock orders...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="restock-management">
      <div className="search-container">
        <div className="search-box">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Quick search by supplier or date"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="restock-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Supplier Name</th>
              <th>View Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.restock_id}>
                <td>{order.restock_id}</td>
                <td>{new Date(order.restock_date).toLocaleDateString()}</td>
                <td>{order.supplier_name}</td>
                <td>
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewDetails(order)}
                    title="View Details"
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && searchTerm && (
        <div className="no-results">
          No restock orders found matching "{searchTerm}"
        </div>
      )}
      {filteredOrders.length === 0 && !searchTerm && !loading && !error && (
         <div className="no-results">
           No restock orders available.
         </div>
       )}
    </div>
  );
};

export default RestockManagement;