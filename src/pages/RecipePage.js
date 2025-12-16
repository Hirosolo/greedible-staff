import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RecipeCard from '../components/RecipeCard';
import EditRecipe from '../components/EditRecipe';
import AddRecipe from '../components/AddRecipe';
import DeleteRecipe from '../components/DeleteRecipe';
import '../styles/RecipePage.css';

const RecipePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define fetchRecipes function outside of useEffect
  const fetchRecipes = async () => {
    try {
      const response = await fetch('https://greedible-backend.vercel.app/api/recipes');
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      const data = await response.json();
      // Assuming the backend returns an array of recipe objects with id, name, image, price, etc.
      // The backend /api/recipes currently returns an array of category objects, each containing an array of items.
      // We need to flatten this structure or modify the backend endpoint to return a flat list if preferred.
      // For now, let's flatten the structure to display recipes.
      const flatRecipes = data.reduce((acc, category) => {
          return acc.concat(category.items);
      }, []);
      setRecipes(flatRecipes);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipes from backend on component mount
  useEffect(() => {
    fetchRecipes(); // Call the defined function
  }, []);

  // Determine activeMenu based on current location.pathname
  const getActiveMenu = (pathname) => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/recipe') return 'Recipe';
    if (pathname === '/inventory') return 'Inventory';
    if (pathname === '/staff') return 'Staff';
    if (pathname === '/user') return 'User';
    return 'Recipe'; // Default to Recipe for this page
  };

  // Navigation logic - chỉ thêm phần này
  const handleMenuClick = (menuId) => {
    console.log('Navigate to:', menuId);
    
    switch (menuId) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Inventory':
        navigate('/inventory');
        break;
      case 'Staff':
        navigate('/staff');
        break;
      case 'User':
        // For now, redirect to dashboard since User page doesn't exist
        navigate('/dashboard');
        break;
      case 'Recipe':
      default:
        // Stay on recipe page
        // The active menu will be handled by getActiveMenu based on the route
        break;
    }
  };

  const handleEdit = async (recipe) => {
    if (!recipe || !recipe.id) {
        console.error('Cannot edit: Recipe or Recipe ID is missing.');
        setError('Cannot edit recipe: Missing information.');
        return;
    }

    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    setShowEditModal(false); // Hide modal initially to show loading or prevent interaction with old data
    setSelectedRecipe(null); // Clear previous selected recipe

    try {
        const response = await fetch(`https://greedible-backend.vercel.app/api/recipes/${recipe.id}`);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to fetch recipe details');
        }
        const fullRecipeData = await response.json();
        
        console.log('Fetched full recipe data:', fullRecipeData); // Log fetched data
        console.log('Type of fullRecipeData.id:', typeof fullRecipeData.id); // Log type of ID
        console.log('Value of fullRecipeData.id:', fullRecipeData.id); // Log value of ID

        setSelectedRecipe(fullRecipeData); // Set state with full data
        setShowEditModal(true); // Show the modal with the full data

    } catch (err) {
        console.error('Error fetching full recipe details:', err);
        setError(`Failed to load recipe details for editing: ${err.message}`);
    } finally {
        setLoading(false); // Stop loading
    }
  };

  const handleDelete = (recipe) => {
    setSelectedRecipe(recipe);
    setShowDeleteModal(true);
  };

  const handleDiscontinue = async (recipe) => {
    if (!recipe || !recipe.id) {
      setError('Cannot discontinue: Missing recipe information.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://greedible-backend.vercel.app/api/recipes/discontinute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: recipe.id })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to discontinue recipe');
      }

      const result = await response.json().catch(() => ({}));
      toast.success(result.message || 'Recipe discontinued successfully');

      // Refresh list
      await fetchRecipes();

    } catch (err) {
      console.error('Error discontinuing recipe:', err);
      toast.error(err.message || 'Failed to discontinue recipe');
      setError(err.message || 'Failed to discontinue recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async (deletedRecipeId) => { // Accept deleted recipe ID from DeleteRecipe
    setLoading(true); // Indicate loading while processing (will be set to false in finally block)
    setError(null); // Clear previous errors

    // Removed the API call logic - the DeleteRecipe component handles the actual deletion
    console.log(`Recipe with ID ${deletedRecipeId} successfully deleted by DeleteRecipe component.`);

    // Display success notification
    alert('Recipe deleted successfully!');

    // Re-fetch recipes to update the list after deletion
    await fetchRecipes();

    // Ensure modal is closed and selected recipe is cleared
    setShowDeleteModal(false);
    setSelectedRecipe(null);
    setLoading(false); // Ensure loading is set to false
    setError(null); // Clear error state here to prevent it from lingering

    // Removed the try...catch...finally block containing the fetch call
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedRecipe(null);
    setError(null); // Clear any previous error
  };

  const handleAddRecipe = () => {
    setShowAddModal(true);
  };

  const handleSaveRecipe = async (result) => { // Accept result object from AddRecipe
    setLoading(true); // Indicate loading while saving (will be set to false in finally block)
    setError(null); // Clear previous errors

    if (result.success) {
      console.log('Recipe operation successful:', result.data);
      // Display success notification
      toast.success(result.message || 'Recipe saved successfully!');

      // Re-fetch recipes to ensure data consistency after add/edit
      // This is generally more robust than trying to update the state manually
      await fetchRecipes(); // Assuming fetchRecipes is available in this scope

      // Close the modal
      setShowAddModal(false);
      setSelectedRecipe(null); // Clear selected recipe if it was an edit
    } else {
      console.error('Recipe operation failed:', result.error);
      // Display error notification
      setError(result.error || 'Failed to save recipe.');
       setLoading(false); // Stop loading on error
    }

    // Removed the try...catch block and the duplicate setShowAddModal(false) from the add/edit logic
    // The loading state will be set to false in the finally block below
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowAddModal(false);
    setShowDeleteModal(false); // Also close delete modal on cancel
    setSelectedRecipe(null); // Clear selected recipe on cancel/close
    setError(null); // Clear errors on closing modals
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name && recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-message">Loading recipes...</div>;
  }

  if (error && !showDeleteModal && !showEditModal && !showAddModal) { // Display error only if no modals are open
      return <div className="error-message">{error}</div>;
  }

  return (
    <div className="recipe-page">
      <Sidebar 
        key={location.pathname}
        onMenuClick={handleMenuClick} 
        activeMenu={getActiveMenu(location.pathname)} // Dynamically set activeMenu
      />
      <div className="main-content">
        <Navbar />
        <div className="content-area">
          {/* Header Container for Title and Add Recipe Button */}
          <div className="recipe-header-container"> 
            {/* Header Title */}
            <div className="recipe-header"> 
              <h1 className="recipe-title">Recipe Management</h1>
            </div>

            {/* Add Recipe Button */}
            <div className="recipe-header-actions"> 
              <button 
                className="add-recipe-btn"
                onClick={handleAddRecipe}
              >
                + Add Recipe
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="search-container"> {/* Add margin for spacing */}
            <input
              type="text"
              className="search-input"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span> {/* Assuming you have a search icon class */}
          </div>

          {/* No recipes found */}
          {filteredRecipes.length === 0 && searchTerm && (
            <div className="no-recipes">
              <p>No recipes found matching "{searchTerm}"</p>
            </div>
          )}
           {filteredRecipes.length === 0 && !searchTerm && !loading && !error && (
            <div className="no-recipes">
              <p>No recipes available in the database.</p>
            </div>
          )}

          {/* Recipe Grid */}
          <div className="recipe-grid">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDiscontinue={handleDiscontinue}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeleteModal && selectedRecipe && (
        <div className="modal-overlay">
          <div className="delete-modal">
            {/* Pass recipeId to DeleteRecipe component */}
            <DeleteRecipe
              recipeId={selectedRecipe.id}
              onDeleteSuccess={handleConfirmDelete} // handleConfirmDelete will now handle the actual API call and state update
              onCancel={handleCancelDelete}
            />
          </div>
        </div>
      )}

      {/* Edit Recipe Modal */}
      {showEditModal && selectedRecipe && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <EditRecipe
              recipe={selectedRecipe}
              onSave={handleSaveRecipe}
              onCancel={handleCloseModals}
            />
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="add-modal">
            <AddRecipe
              onSave={handleSaveRecipe}
              onCancel={handleCloseModals}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipePage;