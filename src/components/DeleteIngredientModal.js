import React, { useState } from 'react';
import { deleteIngredient } from '../api/ingredientApi';
import toast from 'react-hot-toast';

const DeleteIngredientModal = ({ ingredientId, ingredientName, onDeleteSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await deleteIngredient(ingredientId);
      toast.success('Ingredient deleted successfully');
      onDeleteSuccess(ingredientId);
    } catch (err) {
      console.error('Error deleting ingredient:', err);
      const message = err?.message || 'Failed to delete ingredient';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-recipe-modal">
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete "{ingredientName}"?</p>
      {error && <div className="error-message">{error}</div>}
      <div className="modal-actions" style={{marginLeft:'0rem'}}>
        <button className="modal-btn" style={{backgroundColor:'#E0E0E0'}} onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="modal-btn delete-btn" onClick={handleDelete} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default DeleteIngredientModal;
