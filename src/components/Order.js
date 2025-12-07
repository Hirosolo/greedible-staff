import React, { useState, useEffect } from 'react';
import '../styles/Order.css';

const Order = ({ onTabChange, allOrdersData, isLoadingAllOrders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    if (allOrdersData) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const results = allOrdersData.filter(order => {
        const customerName = order.customer_name ? order.customer_name.toLowerCase() : '';
        const customerPhone = order.phone ? order.phone.toLowerCase() : '';
        return (
          customerName.includes(lowerCaseSearchTerm) ||
          customerPhone.includes(lowerCaseSearchTerm)
        );
      });
      setFilteredOrders(results);
    }
  }, [searchTerm, allOrdersData]);

  // Use total_price from backend for display and sorting
  const getTotalPrice = (order) => {
    return order.total_price || 0;
  };

  // Sorting logic
  const sortedOrders = React.useMemo(() => {
    let sortableOrders = [...filteredOrders];
    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        if (sortConfig.key === 'time') {
          const dateA = new Date(a.time);
          const dateB = new Date(b.time);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        if (sortConfig.key === 'totalPrice') {
          const totalA = getTotalPrice(a);
          const totalB = getTotalPrice(b);
          return sortConfig.direction === 'asc' ? totalA - totalB : totalB - totalA;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [filteredOrders, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleTabClick = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  });

  // Helper to format date and time
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Use 24-hour format
    };
    return date.toLocaleDateString('en-GB', options).replace(',', '') + ' ' + date.toLocaleTimeString('en-GB', options);
  };

  return (
    <div className="order-container">
      {/* Header */}
      
      {/* Order Table */}
      <div className="order-table-container">{/* Add a container for styling */}
        <h2>All Orders</h2>
        <div className="order-search-bar">
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoadingAllOrders ? (
          <div className="loading">Loading orders...</div>
        ) : sortedOrders && sortedOrders.length > 0 ? (
          <table className="orders-table">{/* Add a class for styling */}
            <thead>
              <tr>
                <th>Order ID</th>
                <th onClick={() => handleSort('time')} style={{cursor: 'pointer'}}>
                  Time {sortConfig.key === 'time' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th>Order Details</th>
                <th>Status</th>
                <th>Customer Name</th>
                <th>Customer Phone</th>
                <th>Delivery Address</th>
                <th onClick={() => handleSort('totalPrice')} style={{cursor: 'pointer'}}>
                  Total Price {sortConfig.key === 'totalPrice' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
                <tr key={order.order_id}> {/* Use order_id as key */}
                  <td>{order.order_id}</td>
                  <td>{formatDateTime(order.time)}</td>{/* Format time */}
                  <td>
                    {order.order_details && order.order_details.map((item, index) => (
                      <div key={index}>{item.recipe_name} x{item.quantity}</div>
                    ))}{/* Display order items */}
                  </td>
                  <td>{order.status}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.phone}</td>
                  <td>{order.delivery_address}</td>
                  <td>{getTotalPrice(order).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders available.</p>
        )}
      </div>
    </div>
  );
};

export default Order;