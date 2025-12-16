import React, { useState, useEffect } from "react";
import "../styles/StaffManagement.css";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal + form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false); 
  const [notification, setNotification] = useState(""); 

  const [formData, setFormData] = useState({
    staff_name: "",
    staff_email: "",
    password: "",
    role: "",
    phone: "",
    pay_rates: "",
  });

  /* ================= FETCH STAFF ================= */
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("staffToken");
      if (!token) throw new Error("No staff authentication token found");

      const response = await fetch(
        "https://greedible-backend.vercel.app/api/staff/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch staff data: ${response.status}`);
      }

      const data = await response.json();
      setStaff(data.success ? data.staff : []);
    } catch (err) {
      setError("Failed to load staff data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  /* ================= ADD STAFF ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (isAdding) return; // prevent double click

    setIsAdding(true);

    try {
      const token = localStorage.getItem("staffToken");
      if (!token) throw new Error("No staff authentication token found");

      const response = await fetch(
        "https://greedible-backend.vercel.app/api/staff",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            pay_rates: Number(formData.pay_rates),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to add staff");
      }

      // update UI
      setStaff((prev) => [...prev, data.data]);
      setShowAddModal(false);

      setFormData({
        staff_name: "",
        staff_email: "",
        password: "",
        role: "",
        phone: "",
        pay_rates: "",
      });

      // show notification
      setNotification("Staff added successfully!");
      setTimeout(() => setNotification(""), 3000);

    } catch (err) {
      alert(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="loading-message">Loading staff data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="staff-management-container">
      <div className="staff-header">
        <h2>Staff Management</h2>
        <button
          className="add-staff-btn"
          style={{ backgroundColor: "#6B994E" }}
          onClick={() => setShowAddModal(true)}
        >
          + Add New Staff
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="success-notification">{notification}</div>
      )}

      <table className="staff-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.staff_id}>
              <td>{member.staff_id}</td>
              <td>{member.staff_name}</td>
              <td>{member.staff_email}</td>
              <td>{member.role}</td>
              <td>{member.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Staff</h3>

            <form onSubmit={handleAddStaff} className="staff-form">
              <input name="staff_name" placeholder="Staff Name" value={formData.staff_name} onChange={handleInputChange} required />
              <input name="staff_email" type="email" placeholder="Email" value={formData.staff_email} onChange={handleInputChange} required />
              <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
              <input name="role" placeholder="Role" value={formData.role} onChange={handleInputChange} required />
              <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleInputChange} />
              <input name="pay_rates" type="number" step="0.01" placeholder="Pay Rate" value={formData.pay_rates} onChange={handleInputChange} required />

              <div className="modal-actions">
                <button
                  type="submit"
                  className="save-btn"
                  style={{ backgroundColor: "#6B994E" }}
                  disabled={isAdding}
                >
                  {isAdding ? "Adding..." : "Add"}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  style={{ backgroundColor: "#6C757D", color: "white" }}
                  onClick={() => setShowAddModal(false)}
                  disabled={isAdding}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
