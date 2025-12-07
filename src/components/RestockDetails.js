import React, { useState, useEffect } from 'react';
import '../styles/RestockDetails.css';

const RestockDetails = ({ order, onClose }) => {
  const [restockDetails, setRestockDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestockDetails = async () => {
      if (!order || !order.restock_id) {
        // No order selected, or no restock_id available yet
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('staffToken'); // Retrieve staff token
        if (!token) {
          throw new Error('No staff authentication token found'); // Handle missing token
        }

        const response = await fetch(`https://greedible-backend.vercel.app/api/restocks/${order.restock_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`, // Add Authorization header
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch restock details');
        }
        const data = await response.json();
        setRestockDetails(data.restockDetails);
      } catch (err) {
        console.error('Error fetching restock details:', err);
        setError(`Failed to load restock details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRestockDetails();
  }, [order]); // Re-run effect when the order prop changes

  const totalCost = restockDetails ? restockDetails.reduce(
    (sum, item) => sum + (item.import_quantity * item.import_price), 0
  ) : 0;

  if (loading) {
    return <div className="loading-message">Loading restock details...</div>;
  }

   if (error) {
    return (
       <div className="restock-details">
          <div className="details-header">
             <div className="header-info">
                <div className="detail-row">
                   <span className="label">Error:</span>
                   <span className="value error">{error}</span>
                </div>
             </div>
              {onClose && (
               <button className="close-btn" onClick={onClose}>×</button>
              )}
          </div>
       </div>
    );
   }

  // Render null or a message if no details are loaded yet (e.g., initially or if order prop is null)
  if (!restockDetails) {
      return (
          <div className="restock-details">
               <div className="details-header">
                <div className="header-info">
                   <div className="detail-row">
                      <span className="label">No Details:</span>
                       <span className="value">Select a restock order to view details.</span>
                   </div>
                </div>
                 {onClose && (
                  <button className="close-btn" onClick={onClose}>×</button>
                 )}
               </div>
          </div>
      );
  }


  return (
    <div className="restock-details">
      <div className="details-header">
        <div className="header-info">
          <div className="detail-row">
            <span className="label">Restock ID:</span>
            <span className="value">{order?.restock_id}</span>
          </div>
          <div className="detail-row">
            <span className="label">Supplier Name:</span>
            <span className="value">{order?.supplier_name}</span>
          </div>
           <div className="detail-row">
            <span className="label">Restock Date:</span>
            <span className="value">{order?.restock_date ? new Date(order.restock_date).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <div className="ingredients-section">
        <div className="ingredients-table">
          <div className="table-header">
            <div className="col-ingredients">Ingredients</div>
            <div className="col-quantity">Quantity</div>
            <div className="col-unit">Unit</div>
            <div className="col-price">Import Price (vnd)</div>
          </div>
        
          <div className="table-body">
            {restockDetails.map((ingredient, index) => (
              <div key={index} className="table-row">
                <div className="col-ingredients">{ingredient.ingredient_name}</div>
                <div className="col-quantity">{ingredient.import_quantity}</div>
                <div className="col-unit">{ingredient.unit}</div>
                <div className="col-price">{ingredient.import_price.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="total-section">
          <div className="total-row">
            <span className="total-label">Total Cost:</span>
            <span className="total-value">{totalCost.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} vnd</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestockDetails;