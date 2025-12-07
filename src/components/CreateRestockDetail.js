import React, { useState, useEffect } from 'react';
import '../styles/CreateRestockDetail.css';
import { fetchSuppliers, fetchIngredients } from '../api/ingredientApi';

const CreateRestockDetail = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    supplierId: '',
    restockItems: [
      // { ingredient_id: 1, quantity: 10, unit: 'kg', import_price: 5.00 }, // Example structure
    ]
  });

  // State for ingredient search
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState('');
  const [ingredientSearchResults, setIngredientSearchResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [errorSuppliers, setErrorSuppliers] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [errorIngredients, setErrorIngredients] = useState(null);

  // Derive unique units from ingredients
  const uniqueUnits = [...new Set(ingredients.map(ing => ing.unit).filter(unit => unit))]; // Filter out null/undefined units

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await fetchSuppliers();
        setSuppliers(data);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setErrorSuppliers('Failed to load suppliers.');
      } finally {
        setLoadingSuppliers(false);
      }
    };

    const loadIngredients = async () => {
      try {
        const data = await fetchIngredients();
        setIngredients(data);
      } catch (err) {
        console.error('Error fetching ingredients:', err);
        setErrorIngredients('Failed to load ingredients.');
      } finally {
        setLoadingIngredients(false);
      }
    };

    loadSuppliers();
    loadIngredients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItemToList = () => {
    // This function is no longer needed with the search/select pattern
    // The logic is moved to handleSelectIngredient
  };

  const handleRemoveRestockItem = (index) => {
    const newRestockItems = [...formData.restockItems];
    newRestockItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      restockItems: newRestockItems
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.supplierId) {
        alert('Please select a supplier.');
        return;
    }

    if (formData.restockItems.length === 0) {
        alert('Please add at least one ingredient item.');
        return;
    }

    // Format data for backend (backend expects ingredient_id, import_quantity, import_price)
    const dataToSave = {
        supplier_id: parseInt(formData.supplierId),
        // Assuming restock_date is handled by the backend or another part of the form if needed
        items: formData.restockItems.map(item => ({
            ingredient_id: item.ingredient_id,
            import_quantity: parseFloat(item.quantity) || 0, // Ensure number
            import_price: parseFloat(item.import_price) || 0 // Ensure number
        }))
    };

    if (onSave) {
      onSave(dataToSave);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Handle ingredient search input changes
  const handleIngredientSearchChange = (e) => {
    const term = e.target.value;
    setIngredientSearchTerm(term);
    setHighlightedIndex(-1);

    if (term.length > 1) { // Only search if term is at least 2 characters
      const results = ingredients.filter(ing =>
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
    // Check if ingredient is already in the list
    const existingIngredientIndex = formData.restockItems.findIndex(item => item.ingredient_id === ingredient.ingredient_id);

    if (existingIngredientIndex === -1) {
      // Add new ingredient to the list with empty quantity and price
      setFormData(prev => ({
          ...prev,
          restockItems: [
              ...prev.restockItems,
              {
                  ingredient_id: ingredient.ingredient_id,
                  ingredient_name: ingredient.ingredient_name,
                  unit: ingredient.unit, // Assuming unit is available on the ingredient object
                  quantity: '', // Initially empty
                  import_price: '' // Initially empty
              }
          ]
      }));
    } else {
      // Optionally highlight the existing ingredient row or provide feedback
      console.log(`${ingredient.ingredient_name} is already in the restock list.`);
      // You might want to focus on the existing row or give a visual indication
    }

    // Clear search bar and results
    setIngredientSearchTerm('');
    setIngredientSearchResults([]);
    setHighlightedIndex(-1);
  };

  // Handle input change for items in the restockItems table
  const handleItemInputChange = (index, e) => {
    const { name, value } = e.target;
    const newRestockItems = [...formData.restockItems];
    newRestockItems[index][name] = value;
    setFormData(prev => ({
      ...prev,
      restockItems: newRestockItems
    }));
  };

  return (
    <div className="create-restock-detail">
      <div className="form-header">
        <h3 className="form-title">Create Restock Details</h3>
      </div>

      <form onSubmit={handleSubmit} className="restock-form">
        {/* Supplier Selection */}
        <div className="form-group">
          <label className="form-label">Supplier</label>
          {loadingSuppliers ? (
            <div>Loading suppliers...</div>
          ) : errorSuppliers ? (
            <div className="error-message">{errorSuppliers}</div>
          ) : (
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select a supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.supplier_name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Ingredient Search and Selection */}
        <div className="form-group ingredient-search-container">
          <label className="form-label">Add Ingredients</label>
          {loadingIngredients ? (
            <div>Loading ingredients...</div>
          ) : errorIngredients ? (
            <div className="error-message">{errorIngredients}</div>
          ) : (
            <input
              type="text"
              className="form-input"
              placeholder="Search for ingredients..."
              value={ingredientSearchTerm}
              onChange={handleIngredientSearchChange}
              onKeyDown={handleIngredientSearchKeyDown}
            />
          )}

          {/* Display Search Results */}
          {ingredientSearchResults.length > 0 && ingredientSearchTerm.length > 1 && (
            <ul className="ingredient-search-results">
              {ingredientSearchResults.map((ingredient, index) => (
                <li 
                  key={ingredient.ingredient_id} 
                  className={index === highlightedIndex ? 'highlighted' : ''}
                  onClick={() => handleSelectIngredient(ingredient)}
                >
                  {ingredient.ingredient_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Display Added Items in a Table */}
        {formData.restockItems.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Ingredient Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Import Price (vnd)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.restockItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.ingredient_name}</td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={e => handleItemInputChange(index, e)}
                      className="table-input quantity-input"
                      min="0"
                    />
                  </td>
                  <td>
                    {/* Display unit as text instead of an input field */}
                    {item.unit}
                  </td>
                  <td>
                    <input
                      type="number"
                      name="import_price"
                      value={item.import_price}
                      onChange={e => handleItemInputChange(index, e)}
                      className="table-input price-input"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => handleRemoveRestockItem(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="publish-btn"
          >
            Publish Restock
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRestockDetail;