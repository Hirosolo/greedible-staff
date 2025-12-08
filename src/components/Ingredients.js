import React, { useState, useEffect, Fragment } from "react";
import "../styles/Ingredients.css";
import { fetchIngredients } from "../api/ingredientApi";

// Accept wasteData, isLoadingWaste props (allIngredients and isLoadingIngredients are now fetched internally)
const Ingredients = ({
  onTabChange,
  selectedMonth,
  selectedYear,
  wasteData,
  isLoadingWaste,
}) => {
  // State for ingredients data and loading state
  const [allIngredients, setAllIngredients] = useState([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);


  // State for managing the visibility of the "Show All Ingredients" modal
  const [showAllIngredientsModal, setShowAllIngredientsModal] = useState(false);

  // Define the initial number of items to display in the main table
  const initialDisplayCount = 5;

  // Fetch ingredients from API
  useEffect(() => {
    const fetchAllIngredients = async () => {
      setIsLoadingIngredients(true);
      try {
        console.log("Fetching all ingredients from API...");
        const ingredients = await fetchIngredients();
        console.log("All ingredients data fetched:", ingredients);
        setAllIngredients(ingredients);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        setAllIngredients([]);
      } finally {
        setIsLoadingIngredients(false);
      }
    };

    fetchAllIngredients();
  }, []); // Fetch on component mount

  // Function to open the modal
  const handleShowMoreClick = () => {
    setShowAllIngredientsModal(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setShowAllIngredientsModal(false);
  };


  const handleTabClick = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("en-GB", options);
  };

  // Helper to determine overall status (Needs Restock, Good)
  const getIngredientStatus = (ingredient) => {
    let status = "Good";
    let statusColor = "green";

    if (
      ingredient.quantity !== null &&
      ingredient.minimum_threshold !== null &&
      ingredient.quantity <= ingredient.minimum_threshold
    ) {
      status = "Needs Restock";
      statusColor = "orange"; // Or another color to indicate warning
    }

    return {
      status,
      statusColor,
    };
  };


  return (
    <div className="ingredients-container">
      <h2>Ingredients Dashboard</h2>{" "}
      {/* Removed Month/Year as this list is general */}
      {/* Content with original sections */}
      <div className="ingredients-content">
        {/* All Ingredients Section - Replacing Most Imported for full list */}
        <div className="ingredients-section">
          <h3 className="section-title">All Ingredients</h3>
          {isLoadingIngredients ? (
            <div className="loading">
              Loading ingredients...
            </div>
          ) : allIngredients && allIngredients.length > 0 ? (
            <Fragment>
              {" "}
              {/* Wrap table and button in Fragment */}
              <table className="ingredients-table">
                {" "}
                {/* Re-using ingredients-table class */}
                <thead>
                  <tr>
                    <th>Ingredient Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Supplier</th>
                    <th>Expire Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Slice the allIngredients array to show only the initial count */}
                  {allIngredients
                    .slice(0, initialDisplayCount)
                    .map((ingredient) => {
                      // Determine overall status for this ingredient using fetched data
                      const {
                        status,
                        statusColor,
                      } = getIngredientStatus(ingredient);

                      return (
                        <tr key={ingredient.ingredient_id}>
                          <td>{ingredient.ingredient_name}</td>
                          <td>{ingredient.quantity}</td>
                          <td>{ingredient.unit}</td>
                          <td>{ingredient.supplier_name || "N/A"}</td>
                          <td>N/A</td>
                          <td style={{ color: statusColor }}>{status}</td>
                          <td></td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {/* Show More Button - now opens modal */}
              {allIngredients.length > initialDisplayCount && (
                <button
                  onClick={handleShowMoreClick}
                  className="show-more-button"
                >
                  {" "}
                  {/* Add a class for styling */}
                  Show All Ingredients ({allIngredients.length})
                </button>
              )}
            </Fragment> // Close Fragment
          ) : (
            <p>No ingredients available.</p>
          )}
        </div>

        {/* Bottom Section - Contains Waste Materials and Incomplete Orders */}
        <div className="bottom-section">
          {/* Waste Section */}
          <div className="waste-section">
            <h3 className="section-title">Ingredient Waste</h3>
            {isLoadingWaste ? (
              <div className="loading">Loading waste data...</div>
            ) : wasteData && wasteData.length > 0 ? (
              <table className="waste-table">
                <thead>
                  <tr>
                    <th>Ingredient Name</th>
                    <th>Waste Quantity</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteData.map((wasteItem, index) => (
                    <tr key={index}>
                      <td>{wasteItem.ingredient_name}</td>
                      <td>
                        {wasteItem.wasted_quantity} {wasteItem.unit}
                      </td>
                      <td>{wasteItem.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No waste data available for selected month/year.</p>
            )}
          </div>

          {/* Restock Needs Section (formerly Incomplete Orders) */}
          <div className="incomplete-section">
            {" "}
            {/* Reusing this class for consistency */}
            <h3 className="section-title">Restock Needs</h3>
            {isLoadingIngredients ? (
              <div className="loading">Checking restock needs...</div>
            ) : allIngredients && allIngredients.length > 0 ? (
              (() => {
                const ingredientsToRestock = allIngredients.filter(
                  (ingredient) =>
                    ingredient.quantity !== null &&
                    ingredient.minimum_threshold !== null &&
                    ingredient.quantity <= ingredient.minimum_threshold
                );

                if (ingredientsToRestock.length > 0) {
                  return (
                    <table className="incomplete-table">
                      {" "}
                      {/* Reusing this class for styling */}
                      <thead>
                        <tr>
                          <th>Ingredient Name</th>
                          <th>Current Stock</th>
                          <th>Min Threshold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingredientsToRestock.map((ingredient) => (
                          <tr key={ingredient.ingredient_id}>
                            <td>{ingredient.ingredient_name}</td>
                            <td>
                              {ingredient.quantity} {ingredient.unit}
                            </td>
                            <td>
                              {ingredient.minimum_threshold} {ingredient.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                } else {
                  return <p>No ingredients currently need restocking.</p>;
                }
              })()
            ) : (
              <p>No ingredient data available to check restock needs.</p>
            )}
          </div>
        </div>

        {/* General Ingredient Cards - keeping these for now */}
        {/* Re-using ingredients-sections class, consider renaming for clarity */}
      </div>
      {/* The Modal */}
      {showAllIngredientsModal && (
        <div className="modal-overlay">
          {" "}
          {/* Add CSS for modal overlay */}
          <div className="modal-content">
            {" "}
            {/* Add CSS for modal content */}
            <div className="modal-header">
              <h3>All Ingredients</h3>
              <button onClick={handleCloseModal} className="modal-close-button">
                ×
              </button>
            </div>
            <div className="modal-body">
              {" "}
              {/* Add CSS for modal body with potential scrolling */}
              <table className="ingredients-table">
                {" "}
                {/* Re-using ingredients-table class */}
                <thead>
                  <tr>
                    <th>Ingredient Name</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Supplier</th>
                    <th>Expire Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Display ALL ingredients in the modal */}
                  {allIngredients.map((ingredient) => {
                    // Determine overall status for this ingredient
                    const {
                      status,
                      statusColor,
                    } = getIngredientStatus(ingredient);
                    return (
                      <tr key={ingredient.ingredient_id}>
                        <td>{ingredient.ingredient_name}</td>
                        <td>{ingredient.quantity}</td>
                        <td>{ingredient.unit}</td>
                        <td>{ingredient.supplier_name || "N/A"}</td>
                        <td>N/A</td>
                        <td style={{ color: statusColor }}>{status}</td>
                        <td></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;
