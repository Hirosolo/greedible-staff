import React, { useState, useEffect } from "react";
import "../styles/StaffManagement.css";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal + form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "", // 'success' | 'error'
  });
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

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

      // ===== Fetch staff once for duplicate checks (email + phone) =====
      const checkResponse = await fetch(
        "https://greedible-backend.vercel.app/api/staff/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const checkData = await checkResponse.json();

      if (!checkResponse.ok || !checkData?.success) {
        throw new Error(checkData?.message || "Failed to validate staff data.");
      }

      const existingStaff = checkData.staff || [];
      const phoneToCheck = (formData.phone || "").trim();
      const emailToCheck = (formData.staff_email || "").trim().toLowerCase();

      // Phone duplication
      if (phoneToCheck) {
        const phoneExists = existingStaff.some(
          (s) => String(s.phone || "").trim() === phoneToCheck
        );
        if (phoneExists) {
          setNotification({
            message: "Phone number already being used.",
            type: "error",
          });
          setTimeout(() => setNotification({ message: "", type: "" }), 4000);
          return;
        }
      }

      // Email duplication
      if (emailToCheck) {
        const emailExists = existingStaff.some(
          (s) => String(s.staff_email || "").trim().toLowerCase() === emailToCheck
        );
        if (emailExists) {
          setNotification({
            message: "Email already being used.",
            type: "error",
          });
          setTimeout(() => setNotification({ message: "", type: "" }), 4000);
          return;
        }
      }

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

      // show success notification
      setNotification({
        message: "Staff added successfully!",
        type: "success",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    } catch (err) {
      const rawMessage = err?.message || "Failed to add staff.";
      const friendly =
        rawMessage.includes('staff_role_check') || rawMessage.includes('violates check constraint "staff_role_check"')
          ? "Invalid staff role"
          : rawMessage;
      setNotification({
        message: friendly,
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    try {
      setDeletingId(selectedStaff.staff_id);

      const token = localStorage.getItem("staffToken");
      if (!token) throw new Error("No staff authentication token found");

      const response = await fetch(
        "https://greedible-backend.vercel.app/api/staff",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: selectedStaff.staff_id }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete staff");
      }

      setStaff((prev) =>
        prev.filter((s) => s.staff_id !== selectedStaff.staff_id)
      );

      setNotification({
        message: "Staff deleted successfully!",
        type: "success",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);

      setShowDeleteModal(false);
      setSelectedStaff(null);
    } catch (err) {
      setNotification({
        message: err.message || "Failed to delete staff.",
        type: "error",
      });
      setTimeout(() => setNotification({ message: "", type: "" }), 4000);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return <div className="loading-message">Loading staff data...</div>;
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
      {notification.message && (
        <div className={`success-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <table className="staff-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Actions</th>
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
              <td>
                <button
                  className="delete-btn"
                  onClick={() => {
                    setSelectedStaff(member);
                    setShowDeleteModal(true);
                  }}
                  disabled={deletingId === member.staff_id}
                  style={{
                    backgroundColor: "#DC3545",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor:
                      deletingId === member.staff_id
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {deletingId === member.staff_id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Staff</h3>

            <form onSubmit={handleAddStaff} className="staff-form">
              <input
                name="staff_name"
                placeholder="Staff Name"
                value={formData.staff_name}
                onChange={handleInputChange}
                required
              />
              <input
                name="staff_email"
                type="email"
                placeholder="Email"
                value={formData.staff_email}
                onChange={handleInputChange}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <input
                name="role"
                placeholder="Role"
                value={formData.role}
                onChange={handleInputChange}
                required
              />
              <input
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <input
                name="pay_rates"
                type="number"
                step="0.01"
                placeholder="Pay Rate"
                value={formData.pay_rates}
                onChange={handleInputChange}
                required
              />

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

      {showDeleteModal && selectedStaff && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 style={{ color: "#DC3545" }}>Confirm Delete</h3>

            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedStaff.staff_name}</strong>?
            </p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                style={{ backgroundColor: "#6C757D", color: "white", width: '100px'}}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedStaff(null);
                }}
                disabled={deletingId === selectedStaff.staff_id}
              >
                Cancel
              </button>

              <button
                className="delete-btn"
                style={{ backgroundColor: "#DC3545", color: "white", maxWidth: '100px'}}
                onClick={handleDeleteStaff}
                disabled={deletingId === selectedStaff.staff_id}
              >
                {deletingId === selectedStaff.staff_id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
