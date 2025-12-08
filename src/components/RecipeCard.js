import React, { useState } from 'react';
import '../styles/RecipeCard.css';

const RecipeCard = ({ 
  recipe = {
    id: 1,
    name: 'Chicken Noodle Soup',
    image: '/api/placeholder/150/100',
    price: '26.10$'
  },
  onEdit,
  onDelete 
}) => {
  const [imageError, setImageError] = useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(recipe);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(recipe);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="recipe-card">
      {/* Recipe Image */}
      <div className="recipe-image-container">
        {!imageError ? (
          <img 
            src={`https://greedible-backend-staff.vercel.app${recipe.image}`} 
            alt={recipe.name}
            className="recipe-image"
            onError={handleImageError}
          />
        ) : (
          <div className="recipe-image-placeholder">
            <span className="placeholder-icon">🍜</span>
          </div>
        )}
      </div>

      {/* Recipe Info */}
      <div className="recipe-info">
        {/* Remove recipe name, stars, and price */}
        <h3 className="recipe-name">{recipe.name}</h3>
        
        {/* Price */}
        {/* <div className="recipe-price">
          {recipe.price ? recipe.price : '$0.00'}
        </div> */}
        
        {/* Action Buttons */}
        <div className="recipe-actions">
          <button 
            className="edit-btn"
            onClick={handleEdit}
          >
            Edit Recipe
          </button>
          <button 
            className="delete-btn"
            onClick={handleDelete}
          >
            Delete Recipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;