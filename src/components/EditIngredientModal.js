import React, { useState, useEffect } from 'react';
import { fetchIngredients, updateIngredient, fetchSuppliers } from '../api/ingredientApi'; // Added updateIngredient and fetchSuppliers
import '../styles/EditIngredientModal.css'; // Assuming a new CSS file for the modal

const EditIngredientModal = ({ show, onClose, ingredient, onIngredientUpdated }) => {
  const [formData, setFormData] = useState({
    ingredient_name: '',
    quantity: '',
    unit: '',
    minimum_threshold: '',
    supplier_id: '',
    good_for: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ingredient) {
      // Pre-populate form data when ingredient prop changes (modal opens with a new ingredient)
      setFormData({
        ingredient_name: ingredient.ingredient_name || '',
        quantity: ingredient.quantity || '',
        unit: ingredient.unit || '',
        minimum_threshold: ingredient.minimum_threshold || '',
        supplier_id: ingredient.supplier_id || '',
        good_for: ingredient.good_for !== null ? ingredient.good_for : ''
      });
    }
  }, [ingredient]);

  useEffect(() => {
    // Fetch suppliers when the modal is shown
    if (show) {
      const loadSuppliers = async () => {
        try {
          const data = await fetchSuppliers();
          setSuppliers(data);
        } catch (err) {
          console.error('Error fetching suppliers:', err);
          // Handle error appropriately
        }
      };
      loadSuppliers();
    }
  }, [show]); // Fetch suppliers when modal visibility changes


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToUpdate = { ...formData, good_for: parseInt(formData.good_for, 10) || null };
      await updateIngredient(ingredient.ingredient_id, dataToUpdate);
      onIngredientUpdated(); // Notify parent component to refresh data
      onClose(); // Close modal on success
    } catch (err) {
      console.error('Error updating ingredient:', err);
      setError(err.message || 'Failed to update ingredient.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Ingredient</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="ingredient_name">Name:</label>
            <input
              type="text"
              id="ingredient_name"
              name="ingredient_name"
              value={formData.ingredient_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Unit:</label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            />
          </div>
           <div className="form-group">
            <label htmlFor="minimum_threshold">Minimum Threshold:</label>
            <input
              type="number"
              id="minimum_threshold"
              name="minimum_threshold"
              value={formData.minimum_threshold}
              onChange={handleChange}
            />
          </div>
           <div className="form-group">
            <label htmlFor="good_for">Good For (days):</label>
            <input
              type="number"
              id="good_for"
              name="good_for"
              value={formData.good_for}
              onChange={handleChange}
            />
          </div>
           <div className="form-group">
            <label htmlFor="supplier_id">Supplier:</label>
             <select
                id="supplier_id"
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
             >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.supplier_id} value={supplier.supplier_id}>
                    {supplier.supplier_name}
                  </option>
                ))}
             </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIngredientModal; 