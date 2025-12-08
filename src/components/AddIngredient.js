import React, { useState } from 'react';
import '../styles/AddIngredient.css'; // Assuming you will create this CSS file

const AddIngredient = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    ingredient_name: '',
    quantity: '',
    unit: 'kg', // Default unit
    minimum_threshold: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://greedible-backend-staff.vercel.app/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token if needed
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add ingredient');
      }

      console.log('Ingredient added successfully:', data);
      if (onSave) {
        // Pass the new ingredient ID or data back if needed by parent
        onSave(data.ingredientId);
      }
      // Optionally clear form or close modal on success
      // setFormData({ ingredient_name: '', quantity: '', unit: 'kg', minimum_threshold: '' });
    } catch (err) {
      console.error('Error adding ingredient:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-ingredient-container">
      <div className="form-header">
        <h3 className="form-title">Add New Ingredient</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="ingredient-form">
        <div className="form-group">
          <label className="form-label">Ingredient Name</label>
          <input
            type="text"
            name="ingredient_name"
            value={formData.ingredient_name}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="form-input"
              required
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="pcs">pcs</option>
              {/* Add other units as needed */}
            </select>
          </div>
        </div>

         <div className="form-group">
          <label className="form-label">Minimum Threshold (Optional)</label>
          <input
            type="number"
            name="minimum_threshold"
            value={formData.minimum_threshold}
            onChange={handleInputChange}
            className="form-input"
            min="0"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Ingredient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddIngredient; 