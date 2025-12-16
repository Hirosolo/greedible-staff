import React, { useState } from 'react';
import { addIngredient } from '../api/ingredientApi';
import toast from 'react-hot-toast';
import "../styles/IngredientsManagement.css";

const AddIngredientModal = ({ show, onClose, onAdded }) => {
  const [formData, setFormData] = useState({
    ingredient_name: '',
    quantity: '',
    unit: '',
    minimum_threshold: '',
    good_for: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const result = await addIngredient({
        ...formData,
        quantity: Number(formData.quantity),
        minimum_threshold: Number(formData.minimum_threshold),
        good_for: Number(formData.good_for),
      });

      toast.success((result && result.message) ? result.message : 'Ingredient added successfully');

      onAdded(); // refresh list
      onClose();
    } catch (err) {
      console.error('Error adding ingredient:', err);
      setError(err.message || 'Failed to add ingredient');
      toast.error(err.message || 'Failed to add ingredient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Add New Ingredient</h3>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="ingredient_name"
            placeholder="Ingredient name"
            required
            onChange={handleChange}
          />
          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            required
            onChange={handleChange}
          />
          <input
            name="unit"
            placeholder="Unit (kg, g, pcs...)"
            required
            onChange={handleChange}
          />
          <input
            name="minimum_threshold"
            type="number"
            placeholder="Minimum threshold"
            required
            onChange={handleChange}
          />
          <input
            name="good_for"
            type="number"
            placeholder="Good for (days)"
            onChange={handleChange}
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIngredientModal;
