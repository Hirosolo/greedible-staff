import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import IngredientsManagement from '../components/IngredientsManagement';
import RestockManagement from '../components/RestockManagement';
import RestockDetails from '../components/RestockDetails';
import CreateRestockDetail from '../components/CreateRestockDetail';
import AddIngredient from '../components/AddIngredient';
import '../styles/InventoryPage.css';

const InventoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Ingredients Management');
  const [showRestockDetails, setShowRestockDetails] = useState(false);
  const [showCreateRestock, setShowCreateRestock] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddIngredient, setShowAddIngredient] = useState(false); // State for Add Ingredient modal

  const getActiveMenu = (pathname) => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/recipe') return 'Recipe';
    if (pathname === '/inventory') return 'Inventory';
    if (pathname === '/staff') return 'Staff';
    if (pathname === '/user') return 'User';
    return 'Inventory'; // Default to Inventory for this page
  };

  const handleMenuClick = (menuId) => {
    console.log('Navigate to:', menuId);
    
    switch (menuId) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Recipe':
        navigate('/recipe');
        break;
      case 'Staff':
        navigate('/staff');
        break;
      case 'User':
        // For now, redirect to dashboard since User page doesn't exist
        navigate('/dashboard');
        break;
      case 'Inventory':
      default:
        navigate('/inventory');
        break;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowRestockDetails(true);
  };

  const handleCreateRestock = () => {
    setShowCreateRestock(true);
  };

  const handleAddIngredient = () => {
      setShowAddIngredient(true);
  };

  const handleCloseModals = () => {
    setShowRestockDetails(false);
    setShowCreateRestock(false);
    setShowAddIngredient(false); // Close Add Ingredient modal
    setSelectedOrder(null);
  };

  const handleSaveRestock = async (formData) => {
    console.log('Save restock:', formData);
    // Logic to save restock
    try {
      const response = await fetch('https://greedible-backend-staff.vercel.app/api/restock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save restock');
      }

      // Assuming the backend returns the newly created restock or a success indicator
      // const result = await response.json(); // If backend returns data
      console.log('Restock saved successfully!');

      // Display success notification
      alert('Restock published successfully!');

      // Refresh the restock list and close the modal
      handleCloseModals();

      // Optional: Trigger a refresh of the Restock Management list
      // If RestockManagement fetches data on mount or prop change, update state in InventoryPage

    } catch (error) {
      console.error('Error saving restock:', error);
      alert(`Error saving restock: ${error.message}`);
    }
  };

  // TODO: Implement handleSaveIngredient function to handle saving new ingredient via backend API
  const handleSaveIngredient = (ingredientData) => {
      console.log('Save ingredient:', ingredientData);
      // Call backend API to add ingredient
      // On success, close modal and potentially refresh ingredients list
      handleCloseModals();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Ingredients Management':
        // Pass handler to IngredientsManagement
        return <IngredientsManagement onAddIngredientClick={handleAddIngredient} />;
      case 'Restock Management':
        return <RestockManagement onViewDetails={handleViewDetails} />;
      default:
        return <IngredientsManagement onAddIngredientClick={handleAddIngredient} />;
    }
  };

  return (
    <div className="inventory-page">
      <Sidebar 
        key={location.pathname}
        onMenuClick={handleMenuClick} 
        activeMenu={getActiveMenu(location.pathname)}
      />
      <div className="main-content">
        <Navbar />
        <div className="content-area">
          {/* Fixed Tab Bar */}
          <div className="inventory-header">
            <div className="inventory-tabs">
              <div 
                className={`inventory-tab ${activeTab === 'Ingredients Management' ? 'active' : ''}`}
                onClick={() => handleTabChange('Ingredients Management')}
              >
                Ingredients Management
              </div>
              <div 
                className={`inventory-tab ${activeTab === 'Restock Management' ? 'active' : ''}`}
                onClick={() => handleTabChange('Restock Management')}
              >
                Restock Management
              </div>
            </div>
            
            {/* Container for conditional buttons */}
            <div className="inventory-header-actions">
              {activeTab === 'Restock Management' && (
                <button
                  className="create-restock-btn"
                  onClick={handleCreateRestock}
                >
                  + Create Restock
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="inventory-content">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Restock Details Modal */}
      {showRestockDetails && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <RestockDetails
              order={selectedOrder}
              onClose={handleCloseModals}
            />
          </div>
        </div>
      )}

      {/* Create Restock Modal */}
      {showCreateRestock && (
        <div className="modal-overlay">
          <div className="modal-content">
            <CreateRestockDetail
              onSave={handleSaveRestock}
              onCancel={handleCloseModals}
            />
          </div>
        </div>
      )}

      {/* Add Ingredient Modal */}
      {showAddIngredient && (
          <div className="modal-overlay">
              <div className="modal-content">
                  <AddIngredient
                      onSave={handleSaveIngredient}
                      onCancel={handleCloseModals}
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default InventoryPage;