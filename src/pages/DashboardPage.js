import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Revenue from '../components/Revenue'; 
import Order from '../components/Order';
import Ingredients from '../components/Ingredients';
import '../styles/DashboardPage.css';
const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Revenue');
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // Month is 0-indexed
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [dailySalesData, setDailySalesData] = useState([]);
  const [dailyRevenueData, setDailyRevenueData] = useState([]); // New state for daily revenue
  const [dailyImportData, setDailyImportData] = useState([]); // New state for daily import data
  const [employeeData, setEmployeeData] = useState([]); // New state for employee data
  const [allOrdersData, setAllOrdersData] = useState([]); // New state for all orders data
  const [isLoadingAllOrders, setIsLoadingAllOrders] = useState(false); // Loading state for all orders
  const [wasteData, setWasteData] = useState([]); // New state for waste data
  const [isLoadingWaste, setIsLoadingWaste] = useState(false); // Loading state for waste data
  const [allIngredients, setAllIngredients] = useState([]); // New state for all ingredients
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false); // Loading state for ingredients

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  // Effect to fetch sales data when month or year changes
  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const response = await fetch(`https://greedible-backend.vercel.app/api/sales/daily/${selectedYear}/${selectedMonth}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Daily sales data fetched:', data);
        setDailySalesData(data);
      } catch (error) {
        console.error('Error fetching daily sales data:', error);
        setDailySalesData([]); // Clear data on error
      }
    };

    fetchDailySales();

  }, [selectedYear, selectedMonth]); // Depend on year and month

  // Effect to fetch revenue data when month or year changes
  useEffect(() => {
    const fetchDailyRevenue = async () => {
      try {
        // *** Given the constraint to only use provided tools and information: ***
        // The backend /api/orders/revenue endpoint exists and fetches ALL revenue records.
        // We must use this. We will fetch all revenue data and process it on the frontend.
        
        console.log('Fetching all revenue data...');
        const token = localStorage.getItem('staffToken'); // Assuming staff token is stored as 'staffToken'
        if (!token) {
            throw new Error('No staff authentication token found');
        }

        const response = await fetch(`https://greedible-backend.vercel.app/api/orders/revenue`, {
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('All revenue data fetched:', data);

        // Filter data for the selected month and year and aggregate daily revenue
        const filteredRevenue = data.revenue.filter(record => {
            const recordDate = new Date(record.date_recorded);
            return recordDate.getMonth() + 1 === selectedMonth && recordDate.getFullYear() === selectedYear;
        });
        
        // Aggregate revenue by day
        const dailyAggregatedRevenue = filteredRevenue.reduce((acc, record) => {
            const recordDate = new Date(record.date_recorded);
            const day = recordDate.getDate();
            acc[day] = (acc[day] || 0) + parseFloat(record.daily_revenue);
            return acc;
        }, {});

        // Convert aggregated data to array format suitable for chart
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const revenueDataForChart = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            count: dailyAggregatedRevenue[i + 1] || 0
        }));

        setDailyRevenueData(revenueDataForChart);

      } catch (error) {
        console.error('Error fetching or processing revenue data:', error);
        setDailyRevenueData([]); // Clear data on error
      }
    };

    fetchDailyRevenue();

  }, [selectedYear, selectedMonth]); // Depend on year and month

  // Effect to fetch daily import data when month or year changes
  useEffect(() => {
    const fetchDailyImportData = async () => {
      try {
        console.log('Fetching daily import data...', { selectedYear, selectedMonth });
        const token = localStorage.getItem('staffToken'); // Assuming staff token is stored as 'staffToken'
        if (!token) {
            throw new Error('No staff authentication token found');
        }

        // Fetch data from the modified /restocks endpoint with month and year query parameters
        const response = await fetch(`https://greedible-backend.vercel.app/api/restock?month=${selectedMonth}&year=${selectedYear}`, {
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Daily import data fetched:', data);

        if (data.success && data.dailyImportTotals) {
          setDailyImportData(data.dailyImportTotals);
        } else {
          setDailyImportData([]); // Clear data on error or if no totals are returned
        }

      } catch (error) {
        console.error('Error fetching or processing daily import data:', error);
        setDailyImportData([]); // Clear data on error
      }
    };

    fetchDailyImportData();

  }, [selectedYear, selectedMonth]); // Depend on year and month

  // Effect to fetch employee data when component mounts or month/year changes (if pay is monthly/varies)
  // Assuming for now pay_rate is static and doesn't require month/year, fetch on mount.
  // If pay varies by month, add selectedMonth, selectedYear to dependency array and modify backend endpoint.
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        console.log('Fetching employee data...');
        const token = localStorage.getItem('staffToken'); // Assuming staff token is needed
        if (!token) {
            throw new Error('No staff authentication token found');
        }

        // *** This endpoint /api/staff/salaries does NOT exist in your current backend ***
        // You will need to create a backend endpoint to fetch employee name, role, and pay_rate.
        // The response should be an array of objects like: 
        // [{ name: 'Employee Name', role: 'Role', pay_rate: 50000 }, ...]
        const response = await fetch(`https://greedible-backend.vercel.app/api/staff/salaries?month=${selectedMonth}&year=${selectedYear}` , {
             headers: {
                'Authorization': `Bearer ${token}` // Include the token in the headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Employee data fetched:', data);

        if (data.success && data.employees) { // Assuming backend returns { success: true, employees: [...] }
          setEmployeeData(data.employees);
        } else {
          setEmployeeData([]); 
        }

      } catch (error) {
        console.error('Error fetching employee data:', error);
        setEmployeeData([]); 
      }
    };

    fetchEmployeeData();

  }, []); // Fetch only on component mount (assuming static pay rate)

  // Effect to fetch all orders data when the Order tab is active
  useEffect(() => {
    const fetchAllOrdersData = async () => {
      if (activeTab === 'Order') {
        setIsLoadingAllOrders(true);
        try {
          console.log('Fetching all orders data...');
          const token = localStorage.getItem('staffToken'); // Assuming staff token is needed
          if (!token) {
              throw new Error('No staff authentication token found');
          }

          const response = await fetch(`https://greedible-backend.vercel.app/api/orders`, {
               headers: {
                  'Authorization': `Bearer ${token}` // Include the token in the headers
              }
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('All orders data fetched:', data);

          if (data.success && data.orders) { 
            setAllOrdersData(data.orders);
          } else {
            setAllOrdersData([]); 
          }

        } catch (error) {
          console.error('Error fetching all orders data:', error);
          setAllOrdersData([]); 
        } finally {
          setIsLoadingAllOrders(false);
        }
      }
    };

    fetchAllOrdersData();

  }, [activeTab]); // Depend on activeTab

  // Effect to fetch waste data when the Ingredients tab is active
  useEffect(() => {
    const fetchWasteData = async () => {
      if (activeTab === 'Ingredients') {
        setIsLoadingWaste(true);
        try {
          console.log('Fetching waste data...');
          const token = localStorage.getItem('staffToken'); // Assuming staff token is needed
          if (!token) {
              throw new Error('No staff authentication token found');
          }

          const response = await fetch(`https://greedible-backend.vercel.app/api/ingredients/waste`, {
               headers: {
                  'Authorization': `Bearer ${token}` // Include the token in the headers
              }
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Waste data fetched:', data);

          if (data.success && data.waste) { 
            setWasteData(data.waste);
          } else {
            setWasteData([]); 
          }

        } catch (error) {
          console.error('Error fetching waste data:', error);
          setWasteData([]); 
        } finally {
          setIsLoadingWaste(false);
        }
      }
    };

    fetchWasteData();

  }, [activeTab]); // Depend on activeTab

  // Effect to fetch all ingredients when the Ingredients tab is active
  useEffect(() => {
    const fetchAllIngredients = async () => {
      if (activeTab === 'Ingredients') {
        setIsLoadingIngredients(true);
        try {
          console.log('Fetching all ingredients...');
          const token = localStorage.getItem('staffToken'); // Assuming staff token is needed
          if (!token) {
              throw new Error('No staff authentication token found');
          }

          const response = await fetch(`https://greedible-backend.vercel.app/api/ingredients`, {
               headers: {
                  'Authorization': `Bearer ${token}` // Include the token in the headers
              }
          });

          if (!response.ok) {
              // Check if the error is because the other /api/ingredients route is hit
              // This is a temporary check until the redundant route is removed
              const errorText = await response.text();
              console.error('Error fetching all ingredients:', response.status, errorText);
              if (response.status === 200 && errorText.startsWith('[{\n')) { // Check if it looks like the old array response
                  console.log('Likely hit the old /api/ingredients route. Data received:', errorText);
                   // Attempt to parse and set the data if it's the old format
                   try {
                        const oldData = JSON.parse(errorText);
                        if (Array.isArray(oldData)) {
                             console.warn('Using data from the old /api/ingredients route. Update backend.');
                             setAllIngredients(oldData);
                             return; // Exit if data was successfully set
                        }
                   } catch (parseError) {
                       console.error('Failed to parse response from old route:', parseError);
                       // Continue to throw error if parsing fails
                   }

              }
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('All ingredients fetched:', data);

          if (data.success && data.ingredients) { 
            setAllIngredients(data.ingredients);
          } else {
            setAllIngredients([]); 
          }

        } catch (error) {
          console.error('Error fetching all ingredients:', error);
          setAllIngredients([]); 
        } finally {
          setIsLoadingIngredients(false);
        }
      }
    };

    fetchAllIngredients();

  }, [activeTab]); // Depend on activeTab

  // Determine activeMenu based on current location.pathname
  const getActiveMenu = (pathname) => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/recipe') return 'Recipe';
    if (pathname === '/inventory') return 'Inventory';
    if (pathname === '/staff') return 'Staff';
    if (pathname === '/user') return 'User';
    return 'Dashboard'; // Default to Dashboard
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
        navigate('/inventory');
        break;
      default:
        break;
    }
  };

  const renderTabContent = () => {
    // Pass relevant data based on active tab
    const commonProps = {
      onTabChange: handleTabChange,
      selectedMonth: selectedMonth, 
      selectedYear: selectedYear, 
    };

    switch (activeTab) {
      case 'Revenue':
        return <Revenue 
                  {...commonProps} 
                  dailySalesData={dailySalesData}
                  dailyRevenueData={dailyRevenueData}
                  dailyImportData={dailyImportData}
                  employeeData={employeeData} // Pass employee data here too, as it's always fetched
                />;
      case 'Order':
        return <Order {...commonProps} allOrdersData={allOrdersData} isLoadingAllOrders={isLoadingAllOrders} />;
      case 'Ingredients':
        return <Ingredients 
                  {...commonProps} 
                  wasteData={wasteData} 
                  isLoadingWaste={isLoadingWaste}
                  allIngredients={allIngredients} // Pass all ingredients data
                  isLoadingIngredients={isLoadingIngredients} // Pass loading state
                />;
      case 'Import':
        return (
          <div className="import-data">
            {/* Import data content */}
          </div>
        );
      default:
        return <Revenue {...commonProps} />;
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar
        key={location.pathname}
        onMenuClick={handleMenuClick}
        activeMenu={getActiveMenu(location.pathname)}
      />
      <div className="main-content">
        <Navbar />
        <div className="content-area">
          {/* Header with tabs and date/month/year picker */}
          <div className="content-header">
            <div className="content-tabs">
              <div 
                className={`content-tab ${activeTab === 'Revenue' ? 'active' : ''}`}
                onClick={() => handleTabChange('Revenue')}
              >
                Revenue
              </div>
              <div 
                className={`content-tab ${activeTab === 'Order' ? 'active' : ''}`}
                onClick={() => handleTabChange('Order')}
              >
                Order
              </div>
              <div 
                className={`content-tab ${activeTab === 'Ingredients' ? 'active' : ''}`}
                onClick={() => handleTabChange('Ingredients')}
              >
                Ingredients
              </div>
            </div>
            
            {activeTab === 'Revenue' && (
              <div className="content-date">
                <label htmlFor="month-select">Month:</label>
                <select id="month-select" value={selectedMonth} onChange={handleMonthChange} className="month-picker">
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>

                <label htmlFor="year-select">Year:</label>
                <select id="year-select" value={selectedYear} onChange={handleYearChange} className="year-picker">
                  {/* Provide a range of years, e.g., current year +/- 5 */}
                  {[...Array(11)].map((_, i) => {
                    const year = today.getFullYear() - 5 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;