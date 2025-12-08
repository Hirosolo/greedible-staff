import React, { useState } from 'react';

const DeleteRecipe = ({ recipeId, onDeleteSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://greedible-backend-staff.vercel.app/api/recipes/${recipeId}`, {
        method: 'DELETE',
        // TODO: Add authentication token if needed
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete recipe');
      }

      console.log(`Recipe with ID ${recipeId} deleted successfully`);
      onDeleteSuccess(recipeId);
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-recipe-modal">
      <h3>Confirm Deletion</h3>
      <p>Are you sure you want to delete this recipe?</p>
      {error && <div className="error-message">{error}</div>}
      <div className="modal-actions">
        <button className="modal-btn" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="modal-btn delete-btn" onClick={handleDelete} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

export default DeleteRecipe;
