import React, { useState, useEffect, useRef } from 'react';
import '../styles/EditRecipe.css'; // Ensure you have the correct path to your CSS file
import { fetchIngredients } from '../api/ingredientApi';

const EditRecipe = ({ recipe, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [ingredients, setIngredients] = useState([]); // Initialize as empty array
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [fetchingIngredients, setFetchingIngredients] = useState(true);

  // State to store the recipe ID stably
  const [recipeId, setRecipeId] = useState(null);

  // State for success message notification
  const [successMessage, setSuccessMessage] = useState(null);

  // State for nutritional information
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbohydrate, setCarbohydrate] = useState('');
  const [fiber, setFiber] = useState('');

  // State for ingredient search
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const [ingredientSearchResults, setIngredientSearchResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Fetch ingredients when component mounts
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const ingredients = await fetchIngredients();
        console.log('Fetched ingredients data:', ingredients);
        setAvailableIngredients(ingredients);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        // setError('Failed to load ingredients.'); // Consider showing this to the user
      } finally {
        setFetchingIngredients(false);
      }
    };

    loadIngredients();
  }, []); // Fetch ingredients only once on mount

  // Load basic recipe data when recipe prop changes
  useEffect(() => {
    // console.log('Value of recipe.id in EditRecipe:', recipe.id); // Log value of ID in EditRecipe
    console.log('Setting basic data from recipe:', recipe);
    setRecipeId(recipe.recipe_id); // Store the recipe ID in state
    console.log('EditRecipe: recipeId state set to:', recipe.recipe_id); // Confirm state is set
    setTitle(recipe.recipe_name || '');
    setDescription(recipe.description || '');
    setCost(recipe.price || '');
    setCalories(recipe.calories || '');
    setProtein(recipe.protein || '');
    setFat(recipe.fat || '');
    setCarbohydrate(recipe.carbohydrate || '');
    setFiber(recipe.fiber || '');
    setSelectedImage(recipe.image_url || null);
    // Do NOT set ingredients here
  }, [recipe]); // Re-run when recipe changes

  // Load recipe ingredients when recipe prop or availableIngredients change
  useEffect(() => {
      if (recipe && recipe.ingredients && availableIngredients.length > 0) {
          const ingredientsWithNames = recipe.ingredients.map(ingredient => {
              const matchedIngredient = availableIngredients.find(ing => ing.ingredient_id === ingredient.ingredient_id);
              return {
                  ingredient_id: ingredient.ingredient_id,
                  ingredient: matchedIngredient ? matchedIngredient.ingredient_name : '',
                  // Use the numeric amount from the backend, default to 0 if not a number
                  amount: typeof ingredient.amount === 'number' ? ingredient.amount : 0,
              };
          });
          setIngredients(ingredientsWithNames);
      } else if (recipe && !recipe.ingredients) {
          setIngredients([{ ingredient: '', amount: 0 }]); // Initialize with empty item, amount 0
      } else if (!recipe) {
           setIngredients([{ ingredient: '', amount: 0 }]); // Reset ingredients to empty, amount 0
      } else if (recipe && recipe.ingredients && availableIngredients.length === 0) {
           // Keep ingredients as is or set to a loading state, will be updated when availableIngredients loads
           // setIngredients([]); // Optional: reset to empty or loading state while waiting
      }

  }, [recipe, availableIngredients]); // Re-run when recipe or availableIngredients change

  // Effect to clear success message after a few seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        // Call onCancel to close the modal after the message is seen
        if (onCancel) {
          onCancel();
        }
      }, 3000); // Clear after 3 seconds
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [successMessage, onCancel]);

  const addIngredient = () => {
    // Only add a new blank row if the last one isn't empty
    if (ingredients.length === 0 || ingredients[ingredients.length - 1].ingredient_id) {
      setIngredients([...ingredients, { ingredient: '', amount: '' }]);
    } else {
       // Optionally provide feedback to the user that the current row needs to be filled
       console.log('Please fill the current ingredient row before adding a new one.');
    }
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    if (!newIngredients[index]) {
      newIngredients[index] = { ingredient: '', amount: 0 }; // Initialize amount as 0
    }

     // Special handling for amount to ensure it's a number
     if (field === 'amount') {
        const numericValue = parseFloat(value);
        newIngredients[index][field] = isNaN(numericValue) ? 0 : numericValue; // Use parsed number, default to 0 if invalid
     } else {
        newIngredients[index][field] = value;
     }

    // If updating ingredient name directly, try to find ID (less common with search/select)
    if (field === 'ingredient') {
      const matchedIngredient = availableIngredients.find(ing => ing.ingredient_name === value);
      if (matchedIngredient) {
        newIngredients[index].ingredient_id = matchedIngredient.ingredient_id;
      } else {
        // Clear ingredient_id if no match is found
        delete newIngredients[index].ingredient_id;
      }
    }

    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (indexToRemove) => {
    const newIngredients = ingredients.filter((_, index) => index !== indexToRemove);
    setIngredients(newIngredients);
  };

  // Handle ingredient search input changes
  const handleIngredientSearchChange = (e) => {
    const term = e.target.value;
    setIngredientSearchTerm(term);
    setHighlightedIndex(-1);

    if (term.length > 1) { // Only search if term is at least 2 characters
      const results = availableIngredients.filter(ing =>
        ing.ingredient_name.toLowerCase().includes(term.toLowerCase())
      );
      setIngredientSearchResults(results);
    } else {
      setIngredientSearchResults([]); // Clear results if search term is too short
    }
  };

  const handleIngredientSearchKeyDown = (e) => {
    if (ingredientSearchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < ingredientSearchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : ingredientSearchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < ingredientSearchResults.length) {
          handleSelectIngredient(ingredientSearchResults[highlightedIndex]);
        } else if (ingredientSearchResults.length > 0) {
          // If no item is highlighted, select the first one
          handleSelectIngredient(ingredientSearchResults[0]);
        }
        break;
      case 'Escape':
        setIngredientSearchTerm('');
        setIngredientSearchResults([]);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle selecting an ingredient from search results
  const handleSelectIngredient = (ingredient) => {
    // Check if ingredient is already in the recipe
    const existingIngredientIndex = ingredients.findIndex(item => item.ingredient_id === ingredient.ingredient_id);

    if (existingIngredientIndex === -1) {
      // Add new ingredient to the list
      setIngredients([...ingredients, {
        ingredient_id: ingredient.ingredient_id,
        ingredient: ingredient.ingredient_name,
        amount: '', // Start with empty amount
      }]);
    } else {
      // Optionally highlight the existing ingredient row or provide feedback
      console.log(`${ingredient.ingredient_name} is already in the recipe.`);
    }

    // Clear search bar and results
    setIngredientSearchTerm('');
    setIngredientSearchResults([]);
    setHighlightedIndex(-1);
  };

  const handleSave = async () => {
    console.log('EditRecipe: handleSave triggered, current recipeId state:', recipeId); // Log recipeId before check
    // Use the internally stored recipeId state
    if (!recipeId) {
      setError('Recipe ID is missing. Cannot save.');
      return;
    }

    setLoading(true);
    setError(null);

    const formattedIngredients = ingredients
      .filter(item => item.ingredient_id && item.amount)
      .map(item => ({
        ingredient_id: item.ingredient_id,
        weight: parseFloat(item.amount) || 0,
      }));

    if (formattedIngredients.length === 0) {
        setError('Please add at least one valid ingredient with amount.');
        setLoading(false);
        return;
    }

    const updatedRecipeData = {
      recipe_name: title,
      // TODO: Add category selection to the form
      category: 'Main Dishes', // Placeholder
      // TODO: Add fields for nutritional info if needed in the form
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      fat: parseFloat(fat) || 0,
      carbohydrate: parseFloat(carbohydrate) || 0,
      fiber: parseFloat(fiber) || 0,
      price: parseFloat(cost) || 0,
      // TODO: Implement image upload
      image_url: selectedImage || '/api/placeholder/200/150', // Placeholder image
      ingredients: formattedIngredients,
    };

    try {
      const response = await fetch(`https://greedible-backend.vercel.app/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication token if needed
        },
        body: JSON.stringify(updatedRecipeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update recipe');
      }

      console.log('Recipe updated successfully'); // Keep console log for debugging
      setSuccessMessage('Recipe updated successfully!'); // Set success message
      setError(null); // Clear any previous errors

      // Call onSave if needed by parent or handle success feedback
      if (onSave) {
        // Pass the updated recipe data back, ensuring the correct stored id is included
        onSave({ ...updatedRecipeData, recipe_id: recipeId });
      }
      // Optionally close the modal/form
      // onCancel();
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-recipe-container">
      <div className="edit-recipe-header">
        <h2>Edit Recipe</h2>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel} disabled={loading || fetchingIngredients}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave} disabled={loading || fetchingIngredients}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      {fetchingIngredients && <div className="loading-message">Loading ingredients...</div>}

      <div className="recipe-content">
        {/* Left Side - Recipe Image */}
        <div className="image-section">
          <div
            className="recipe-image-container"
          >
            {selectedImage ? (
              <img
                src={`https://greedible-backend.vercel.app${selectedImage}`}
                alt={title}
                className="recipe-image"
                onError={(e) => {
                  // Optionally set a placeholder if the image fails to load
                  // setImageError(true);
                }}
              />
            ) : (
              <div className="recipe-image-placeholder">
                <span className="placeholder-icon">🍽️</span>
                <p>No Image Available</p>
              </div>
            )}
          </div>
           {/* TODO: Add functionality to change/upload image */}
        </div>

        {/* Right Side - Form (Basic Information) */}
        <div className="form-section">
          {/* Title */}
          <div className="form-group">
            <label>Recipe Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              readOnly
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows="4"
            />
          </div>
           {/* Category - Add if needed in the future */}
           {/* <div className="form-group"><label>Category</label><input type="text" className="form-input" value={recipe?.category || ''} readOnly /></div> */}
        </div>
      </div>

      {/* Nutritional Information Section - Moved and Restructured */}
      <div className="nutritional-information-section">
           <h3>Nutritional Information</h3>
           {/* Assuming nutritional fields are part of the recipe object fetched from backend */}
           {/* You will need to add state variables for these fields and inputs similar to title/description */}
           
           <div className="nutritional-grid">
                <div className="form-group"><label>Calories:</label><input type="number" className="form-input" value={calories} onChange={(e) => setCalories(e.target.value)} /></div>
                <div className="form-group"><label>Protein (g):</label><input type="number" className="form-input" value={protein} onChange={(e) => setProtein(e.target.value)} /></div>
                <div className="form-group"><label>Fat (g):</label><input type="number" className="form-input" value={fat} onChange={(e) => setFat(e.target.value)} /></div>
                <div className="form-group"><label>Carbohydrates (g):</label><input type="number" className="form-input" value={carbohydrate} onChange={(e) => setCarbohydrate(e.target.value)} /></div>
                <div className="form-group"><label>Fiber (g):</label><input type="number" className="form-input" value={fiber} onChange={(e) => setFiber(e.target.value)} /></div>
                
                {/* Price Input */}
                 <div className="form-group"><label>Price (vnd):</label><input type="number" className="form-input" value={cost} onChange={(e) => setCost(e.target.value)} /></div>
           </div>
      </div>

      {/* Ingredients Section */}
      <div className="ingredients-section">
        <h3>Ingredients</h3>

        <div className="form-group ingredients-search">
            <label>Search Ingredients</label>
            {/* Ingredient Search Input */}
            <input
              type="text"
              className="ingredient-search-input" /* Use the new style */
              placeholder="Search for ingredients..."
              value={ingredientSearchTerm}
              onChange={handleIngredientSearchChange}
              onKeyDown={handleIngredientSearchKeyDown}
              disabled={fetchingIngredients}
            />
            {/* Display Search Results as suggestions below the input */}
            {ingredientSearchResults.length > 0 && ingredientSearchTerm.length > 1 && (
                <ul className="ingredient-search-results">
                    {ingredientSearchResults.map((ing, index) => (
                        <li 
                            key={ing.ingredient_id} 
                            className={index === highlightedIndex ? 'highlighted' : ''}
                            onClick={() => handleSelectIngredient(ing)}
                        >
                            {ing.ingredient_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>

         {/* Display Selected Ingredients as Table */}
            <div className="selected-ingredients-table-container">
                <table className="ingredients-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ingredient Name</th>
                            <th>Quantity (g)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients.map((ingredientItem, index) => {
                           return (
                            <tr key={index}>
                                <td>{ingredientItem.ingredient_id}</td>
                                <td>{ingredientItem.ingredient}</td>
                                <td>
                                    <input
                                        type="number"
                                        className="amount-input"
                                        placeholder="Amount"
                                        value={ingredientItem.amount}
                                        onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                                    />
                                </td>
                                <td>
                                    {/* Placeholder remove button - implement logic later */}
                                    <button className="remove-ingredient-btn" onClick={() => handleRemoveIngredient(index)}>
                                        Remove
                                    </button>
                                </td>
                            </tr>
                         );
                     })}
                    </tbody>
                </table>
            </div>

      </div>

    </div>
  );
};

export default EditRecipe;