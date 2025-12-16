import React, { useState, useEffect } from 'react';
import { fetchIngredients, updateIngredient, fetchSuppliers } from '../api/ingredientApi'; // Added updateIngredient and fetchSuppliers
import '../styles/EditIngredientModal.css'; // Assuming a new CSS file for the modal

const EditIngredientModal = ({ show, onClose, ingredient, onIngredientUpdated }) => {
  const [formData, setFormData] = useState({
    ingredient_name: '',
    unit: '',
    minimum_threshold: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ingredient) {
      setFormData({
        ingredient_name: ingredient.ingredient_name || '',
        unit: ingredient.unit || '',
        minimum_threshold: ingredient.minimum_threshold || ''
      });
    }
  }, [ingredient]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Only allow updating name, unit and minimum_threshold
      // Include existing quantity and good_for so API receives required fields
      const dataToUpdate = {
        ingredient_name: formData.ingredient_name,
        quantity: ingredient && typeof ingredient.quantity !== 'undefined' ? Number(ingredient.quantity) : 0,
        unit: formData.unit,
        minimum_threshold: Number(formData.minimum_threshold),
        good_for: ingredient && typeof ingredient.good_for !== 'undefined' ? Number(ingredient.good_for) : null
      };
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