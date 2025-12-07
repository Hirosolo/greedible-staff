import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import '../styles/Revenue.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const Revenue = ({ onTabChange, dailySalesData, selectedMonth, selectedYear, dailyRevenueData, dailyImportData, employeeData }) => {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Function to get the number of days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // Generate data points for all days of the month
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1); // [1, 2, ..., daysInMonth]

  // Map fetched sales data for easy lookup
  const salesDataMap = dailySalesData.reduce((map, dayData) => {
    map[dayData.day] = dayData.count;
    return map;
  }, {});

  // Create labels and data for the chart for all days
  const chartLabels = allDays.map(day => {
    const month = String(selectedMonth).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${dayStr}/${month}/${selectedYear}`;
  });

  // Create data points for daily orders chart
  const dailyOrdersDataPoints = allDays.map(day => salesDataMap[day] || 0);

  // Map fetched revenue data for easy lookup - Corrected and ensure number type
  const revenueDataMap = dailyRevenueData.reduce((map, revenueRecord) => {
    map[revenueRecord.day] = parseFloat(revenueRecord.count) || 0; 
    return map;
  }, {});

  // Create data points for daily revenue chart
  const dailyRevenueDataPoints = allDays.map(day => revenueDataMap[day] || 0); // Get revenue from map or 0

  // Map fetched import data for easy lookup - Assuming backend provides day and total_import_price
  const importDataMap = dailyImportData.reduce((map, importRecord) => {
    map[importRecord.day] = parseFloat(importRecord.total_import_price) || 0; // Use total_import_price property and ensure number type
    return map;
  }, {});

  // Create data points for daily import chart
  const dailyImportDataPoints = allDays.map(day => importDataMap[day] || 0); // Get import price from map or 0

  // Format data for Chart.js
  const chartData = {
    labels: chartLabels, // Use generated labels for all days
    datasets: [
      {
        label: 'Number of Orders',
        data: dailyOrdersDataPoints, // Use generated data points for all days
        borderColor: '#1E3A8A', // Change to a dark blue color
        borderWidth: 2, // Adjust border width for the line
        fill: false, // Do not fill area under the line
        tension: 0.1, // Add tension for curved lines (optional)
        pointBackgroundColor: '#1E3A8A', // Color of data points (dark blue)
        pointBorderColor: '#fff', // Border color of data points
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#1E3A8A', // Hover border color (dark blue)
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Order Count per Month',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.raw + ' orders';
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of the Month',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Number of Orders',
        },
        beginAtZero: true,
        ticks: {
            stepSize: 1,
            callback: function(value) {
                if (value % 1 === 0) {
                    return value; 
                }
            }
        }
      },
    },
  };

  // Format data for Daily Revenue Chart
  const dailyRevenueChartData = {
    labels: chartLabels, // Use generated labels for all days
    datasets: [
      {
        label: 'Daily Revenue',
        data: dailyRevenueDataPoints, // Use generated data points for all days
        borderColor: '#047857', // A different color for revenue line (e.g., dark green)
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: '#047857',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#047857',
      },
    ],
  };

  const dailyRevenueChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Revenue per Month',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            // Format revenue amount with currency
            label += `${formatCurrency(context.raw)}`; // Assuming formatCurrency is available or defined here
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of the Month',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Revenue (vnd)',
        },
        beginAtZero: true,
        // You might want to format y-axis ticks for currency, but let's keep it simple for now
      },
    },
  };
  
  // Format data for Daily Import Price Chart
  const dailyImportChartData = {
    labels: chartLabels, // Use generated labels for all days
    datasets: [
      {
        label: 'Daily Import Price',
        data: dailyImportDataPoints, // Use generated data points for all days
        borderColor: '#F59E0B', // A different color for import line (e.g., amber)
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#F59E0B',
      },
    ],
  };

  const dailyImportChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Import Price per Month',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            // Format import price amount with currency
            label += `${formatCurrency(context.raw)}`; // Assuming formatCurrency is available
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Day of the Month',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Import Price (vnd)',
        },
        beginAtZero: true,
      },
    },
  };

  // Helper to format currency (ensure this is defined or imported)
  // If formatCurrency is not available, you'll need to add it or import it.
  // Based on previous context, it seems formatCurrency was in Account.js. You might need a shared helper.
  // For now, let's define a simple one here or assume it's available.
  const formatCurrency = (amount) => {
    // Ensure amount is a number
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return amount; // Return original if not a number

    // Convert to integer to remove decimals, then to string
    const amountStr = Math.floor(numAmount).toString();
    // Use regex to add dot as thousand separator
    const formattedAmount = amountStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedAmount} vnd`;
  };

  const handleTabClick = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Calculate today's sales, import, and revenue
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === selectedYear && (today.getMonth() + 1) === selectedMonth;
  const todayDay = today.getDate();
  const todaySales = isCurrentMonth ? (salesDataMap[todayDay] || 0) : 0;
  const todayImport = isCurrentMonth ? (importDataMap[todayDay] || 0) : 0;
  const todayRevenue = isCurrentMonth ? (revenueDataMap[todayDay] || 0) : 0;

  return (
    <div className="dashboard-container">
      {/* Header with tabs and date */}
      

      {/* Dashboard Content */}
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Sale Card - Daily Orders Count Chart */}
          <div className="dashboard-card sale-card">
            <div className="card-header">
              <h3>Daily Orders Count</h3>
            </div>
            {/* Today sales line */}
            <div style={{ padding: '0 1.5rem 0.5rem 1.5rem', fontWeight: 500, color: '#1E3A8A' }}>
              Today sales: {todaySales}
            </div>
            <div className="card-content">
              <div className="daily-sales-chart-area">
                {dailySalesData && dailySalesData.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <p>No order data available for the selected month.</p>
                )}
              </div>
            </div>
          </div>

          {/* Salaries Card - Employee Salaries Table */}
          <div className="dashboard-card salaries-card">
            <div className="card-header">
              <h3>Employee Salaries ({selectedMonth}/{selectedYear})</h3>{/* Updated title */}
            </div>
            <div className="card-content">
              {employeeData && employeeData.length > 0 ? (
                <table className="salaries-table">{/* Add a class for styling */}
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Salaries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeData.map((employee, index) => (
                      <tr key={index}> {/* Use a unique key if possible, like employee ID */}
                        <td>{employee.name}</td>
                        <td>{employee.role}</td>
                        <td>{formatCurrency(employee.total_pay)}</td>{/* Show calculated salary */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No employee data available.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="dashboard-right">
          {/* Import Price Card - Daily Import Price Chart */}
          <div className="dashboard-card import-card">
            <div className="card-header">
              <h3>Daily Import Price</h3>{/* Updated title */}
            </div>
            {/* Today import line */}
            <div style={{ padding: '0 1.5rem 0.5rem 1.5rem', fontWeight: 500, color: '#F59E0B' }}>
              Today import: {formatCurrency(todayImport)}
            </div>
            <div className="card-content">
              {/* Display daily import price chart */}
              <div className="daily-import-chart-area">{/* New container for import chart */}
                {dailyImportData && dailyImportData.length > 0 ? (
                   <Line data={dailyImportChartData} options={dailyImportChartOptions} />
                ) : (
                  <p>No import data available for the selected month.</p>
                )}
              </div>

              {/* Remove static elements */}
              {/*
              <div className="metric-row">
                <div className="metric-icon">🔒</div>
                <div className="metric-divider">—</div>
                <div className="metric-value">30.000 vnd</div>
              </div>
              <div className="metric-label">Example2</div>
              */}
            </div>
          </div>

          {/* Revenue Card - Daily Revenue Chart */}
          <div className="dashboard-card revenue-card">
            <div className="card-header">
              <h3>Daily Revenue</h3>{/* Updated title */}
            </div>
            {/* Today revenue line */}
            <div style={{ padding: '0 1.5rem 0.5rem 1.5rem', fontWeight: 500, color: '#047857' }}>
              Today revenue: {formatCurrency(todayRevenue)}
            </div>
            <div className="card-content">
              {/* Display daily revenue chart */}
              <div className="daily-revenue-chart-area">{/* New container for revenue chart */}
                {dailyRevenueData && dailyRevenueData.length > 0 ? (
                   <Line data={dailyRevenueChartData} options={dailyRevenueChartOptions} />
                ) : (
                  <p>No revenue data available for the selected month.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;