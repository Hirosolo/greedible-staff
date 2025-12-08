import React, { useState, useEffect, useRef } from 'react';
import '../styles/AddRecipe.css'; // Assuming you have a CSS file for styles
import { fetchIngredients } from '../api/ingredientApi';

const AddRecipe = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [fetchingIngredients, setFetchingIngredients] = useState(true);

  // State for nutritional information
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbohydrate, setCarbohydrate] = useState('');
  const [fiber, setFiber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // State for ingredient search
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const [ingredientSearchResults, setIngredientSearchResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Ref for the file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const ingredients = await fetchIngredients();
        console.log('Fetched ingredients data:', ingredients);
        setAvailableIngredients(ingredients);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        setError('Failed to load ingredients. Please make sure you are logged in.');
      } finally {
        setFetchingIngredients(false);
      }
    };

    loadIngredients();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
  };

  const addIngredient = () => {
    if (ingredients.length === 0 || ingredients[ingredients.length - 1].ingredient_id) {
        setIngredients([...ingredients, { ingredient: '', amount: '' }]);
    } else {
        console.log('Please fill the current ingredient row before adding a new one.');
    }
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    if (!newIngredients[index]) {
      newIngredients[index] = { ingredient: '', amount: 0 };
    }

    if (field === 'amount') {
        const numericValue = parseFloat(value);
        newIngredients[index][field] = isNaN(numericValue) ? 0 : numericValue;
     } else {
        newIngredients[index][field] = value;
     }

    if (field === 'ingredient') {
      const matchedIngredient = availableIngredients.find(ing => ing.ingredient_name === value);
      if (matchedIngredient) {
        newIngredients[index].ingredient_id = matchedIngredient.ingredient_id;
      } else {
        delete newIngredients[index].ingredient_id;
      }
    }

    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (indexToRemove) => {
    const newIngredients = ingredients.filter((_, index) => index !== indexToRemove);
    setIngredients(newIngredients);
  };

  const handleIngredientSearchChange = (e) => {
    const term = e.target.value;
    setIngredientSearchTerm(term);
    setHighlightedIndex(-1);
    console.log('Search term:', term);
    console.log('Available ingredients for search:', availableIngredients);

    if (term.length > 1) {
      const results = availableIngredients.filter(ing =>
        ing.ingredient_name.toLowerCase().includes(term.toLowerCase())
      );
      setIngredientSearchResults(results);
      console.log('Search results:', results);
    } else {
      setIngredientSearchResults([]);
      console.log('Search results cleared.');
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

  const handleSelectIngredient = (ingredient) => {
    const existingIngredientIndex = ingredients.findIndex(item => item.ingredient_id === ingredient.ingredient_id);

    if (existingIngredientIndex === -1) {
      setIngredients([...ingredients, {
        ingredient_id: ingredient.ingredient_id,
        ingredient: ingredient.ingredient_name,
        amount: '',
        unit: ingredient.unit,
      }]);
    } else {
      console.log(`${ingredient.ingredient_name} is already in the recipe.`);
    }

    setIngredientSearchTerm('');
    setIngredientSearchResults([]);
    setHighlightedIndex(-1);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    // Validation checks
    if (!title.trim()) {
      setError('Recipe name cannot be empty.');
      setLoading(false);
      return;
    }

    const parsedCalories = parseFloat(calories);
    const parsedProtein = parseFloat(protein);
    const parsedFat = parseFloat(fat);
    const parsedCarbohydrate = parseFloat(carbohydrate);
    const parsedFiber = parseFloat(fiber);
    const parsedCost = parseFloat(cost);

    if (parsedCalories < 0 || parsedProtein < 0 || parsedFat < 0 || parsedCarbohydrate < 0 || parsedFiber < 0) {
        setError('Nutritional values cannot be negative.');
        setLoading(false);
        return;
    }

    // Check if at least one nutritional value is greater than 0
    if (!((parsedCalories > 0) || (parsedProtein > 0) || (parsedFat > 0) || (parsedCarbohydrate > 0) || (parsedFiber > 0))) {
        setError('At least one nutritional value (Calories, Protein, Fat, Carbohydrates, or Fiber) must be greater than 0.');
        setLoading(false);
        return;
    }

    if (isNaN(parsedCost) || parsedCost <= 0) {
        setError('Price must be a positive number.');
        setLoading(false);
        return;
    }

    const formattedIngredients = ingredients
      .filter(item => item.ingredient_id && item.amount)
      .map(item => ({
        ingredient_id: item.ingredient_id,
        weight: parseFloat(item.amount) || 0,
      }));

    if (formattedIngredients.length === 0) {
        setError('Please add at least one ingredient.');
        setLoading(false);
        return;
    }

    // Check if quantity of each ingredient is > 0
    const hasInvalidQuantity = formattedIngredients.some(item => item.weight <= 0);
    if (hasInvalidQuantity) {
        setError('Quantity for all added ingredients must be greater than 0.');
        setLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append('recipe_name', title.trim()); // Use trimmed title
    formData.append('category', selectedCategory);
    formData.append('calories', parsedCalories || 0); // Use parsed values
    formData.append('protein', parsedProtein || 0);
    formData.append('fat', parsedFat || 0);
    formData.append('carbohydrate', parsedCarbohydrate || 0);
    formData.append('fiber', parsedFiber || 0);
    formData.append('price', parsedCost || 0);
    formData.append('description', description);
    if (selectedImage) {
      formData.append('image', selectedImage);
    } else {
      formData.append('image_url', '/assets/placeholder.jpg');
    }
    formData.append('ingredients', JSON.stringify(formattedIngredients));

    try {
      const response = await fetch('https://greedible-backend-staff.vercel.app/api/recipes', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Pass error to parent's onSave handler
        if (onSave) {
            onSave({ success: false, error: data.error || 'Failed to add recipe' });
        }
        throw new Error(data.error || 'Failed to add recipe'); // Still throw for local error handling
      }

      console.log('Recipe added successfully:', data);
      // setSuccessMessage('Recipe added successfully!'); // Removed setting success message here
      setError(null);

      // Call onSave with success data
      if (onSave) {
        onSave({ success: true, data: data, message: 'Recipe added successfully!' }); // Pass success status, data, and message
      }
    } catch (err) {
      console.error('Error adding recipe:', err);
      setError(err.message);
      // Error is already handled by the throw and catch above, but can also pass to onSave here if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-recipe-container">
      <div className="add-recipe-header">
        <h2>Add New Recipe</h2>
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
      {/* {successMessage && <div className="success-message">{successMessage}</div>} // Success message handled by parent */}
      {fetchingIngredients && <div className="loading-message">Loading ingredients...</div>}

      <div className="recipe-content">
        <div className="image-section">
            <div
                className="recipe-image-container"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current.click()}
            >
                {selectedImage ? (
                     <img
                        src={typeof selectedImage === 'string' ? `https://greedible-backend-staff.vercel.app${selectedImage}` : URL.createObjectURL(selectedImage)}
                        alt="Selected Recipe"
                     />
                ) : (
                    <div className="upload-placeholder">
                        <span>Click or drag image here</span>
                    </div>
                )}
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Recipe Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="Enter recipe name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input"
            >
              <option value="">Select a Category</option>
              <option value="Main Dishes">Main Dishes</option>
              <option value="Side Dishes">Side Dishes</option>
              <option value="Salads">Salads</option>
              <option value="Pasta & Noodles">Pasta & Noodles</option>
              <option value="Rice Dishes">Rice Dishes</option>
              <option value="Soup">Soup</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows="4"
              placeholder="Enter recipe description"
            />
          </div>
        </div>
      </div>

      <div className="nutritional-information-section">
           <h3>Nutritional Information (per serving)</h3>

           <div className="nutritional-grid">
                <div className="form-group"><label>Calories:</label><input type="number" className="form-input" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="kcal" /></div>
                <div className="form-group"><label>Protein (g):</label><input type="number" className="form-input" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="grams" /></div>
                <div className="form-group"><label>Fat (g):</label><input type="number" className="form-input" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="grams" /></div>
                <div className="form-group"><label>Carbohydrates (g):</label><input type="number" className="form-input" value={carbohydrate} onChange={(e) => setCarbohydrate(e.target.value)} placeholder="grams" /></div>
                <div className="form-group"><label>Fiber (g):</label><input type="number" className="form-input" value={fiber} onChange={(e) => setFiber(e.target.value)} placeholder="grams" /></div>

                 <div className="form-group"><label>Price ($):</label><input type="number" className="form-input" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="e.g., 12.99" /></div>
           </div>
      </div>

      <div className="ingredients-section">
        <h3>Ingredients</h3>

        <div className="form-group ingredients-search">
            <label>Search and Add Ingredients</label>
            <input
              type="text"
              className="ingredient-search-input"
              placeholder="Search for ingredients..."
              value={ingredientSearchTerm}
              onChange={handleIngredientSearchChange}
              onKeyDown={handleIngredientSearchKeyDown}
              disabled={fetchingIngredients}
            />
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
                        {ingredients.length === 0 ? (
                             <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>No ingredients added yet. Search and select above.</td>
                             </tr>
                        ) : (
                            ingredients.map((ingredientItem, index) => {
                                return (
                                    <tr key={ingredientItem.ingredient_id || index}>
                                        <td>{ingredientItem.ingredient_id || 'N/A'}</td>
                                        <td>{ingredientItem.ingredient || 'Select Ingredient'}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="amount-input"
                                                placeholder="Amount"
                                                value={ingredientItem.amount}
                                                onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                                            /> {ingredientItem.unit}
                                        </td>
                                        <td>
                                            <button className="remove-ingredient-btn" onClick={() => handleRemoveIngredient(index)}>
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

      </div>
    </div>
  );
};

export default AddRecipe;