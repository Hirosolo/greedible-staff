import React, { useState, useEffect, useCallback } from "react";
import "../styles/ShiftView.css";
import ShiftDetail from "./ShiftDetail";
import { useAuth } from "../contexts/AuthContext";

const ShiftView = ({ scheduleRefreshTrigger }) => {
  const { user } = useAuth();

  const today = new Date();

  // ===== Month / Year State =====
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1–12
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // ===== Data State =====
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== Modal State =====
  const [showShiftDetailModal, setShowShiftDetailModal] = useState(false);
  const [selectedShiftForDetail, setSelectedShiftForDetail] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newShiftDate, setNewShiftDate] = useState("");
  const [newShiftType, setNewShiftType] = useState("morning");
  const [isCreatingShift, setIsCreatingShift] = useState(false);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const weekDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // ===== Fetch Monthly Schedule =====
  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("staffToken");
      if (!token) throw new Error("No staff authentication token found");

      const response = await fetch(
        "https://greedible-backend.vercel.app/api/schedules/month",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            month: selectedMonth,
            year: selectedYear,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch schedule data: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.schedule) {
        const grouped = data.schedule.reduce((acc, day) => {
          acc[day.date] = day.shifts;
          return acc;
        }, {});
        setScheduleData(grouped);
      } else {
        setScheduleData({});
      }
    } catch (err) {
      setError("Failed to load schedule data.");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule, refreshKey, scheduleRefreshTrigger]);

  // ===== Month Days =====
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(selectedYear, selectedMonth - 1, i + 1);
    return {
      date: i + 1,
      fullDate: date,
    };
  });

  // ===== Handlers =====
  const handleShiftClick = (date, shift, fullDate) => {
    setSelectedShiftForDetail({
      date,
      fullDate,
      ...shift,
    });
    setShowShiftDetailModal(true);
  };

  const handleAddShiftClick = () => {
    setShowDatePicker(true);
  };

  const handleCreateShift = async () => {
    if (!newShiftDate || isCreatingShift) return;

    setIsCreatingShift(true);

    try {
      const token = localStorage.getItem("staffToken");
      if (!token) throw new Error("No staff authentication token found");

      const response = await fetch(
        "https://greedible-backend.vercel.app/api/schedules",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shift_date: newShiftDate,
            shift: newShiftType,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create shift");
      }

      setNotification({
        message: "Shift created successfully",
        type: "success",
      });
      setRefreshKey((prev) => prev + 1);

      setShowDatePicker(false);
      setNewShiftDate("");
      setNewShiftType("morning");

      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    } catch (err) {
      setNotification({ message: err.message, type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } finally {
      setIsCreatingShift(false);
    }
  };

  if (loading)
    return <div className="loading-message">Loading schedule...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="shift-view">
      {notification.message && (
        <div className={`shift-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="shift-header">
        <h2 className="shift-title">Shift View</h2>

        {/* ===== Month Navigation ===== */}
        <div className="month-navigation">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = today.getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>

          {(user?.role?.toLowerCase() === "manager" || user?.role?.toLowerCase() === "admin") && (
            <button className="add-shift-btn" onClick={handleAddShiftClick}>
              Add Shift
            </button>
          )}
        </div>
      </div>

      {/* ===== Calendar ===== */}
      <div className="shift-calendar">
        <div className="calendar-grid">
          {/* ===== Weekday Header ===== */}
          {weekDayNames.map((day) => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}

          {/* ===== Empty cells before month start (Monday-based) ===== */}
          {Array.from({
            length:
              (new Date(selectedYear, selectedMonth - 1, 1).getDay() + 6) % 7,
          }).map((_, i) => (
            <div key={`empty-${i}`} className="day-cell empty" />
          ))}

          {/* ===== Month Days ===== */}
          {monthDates.map(({ date, fullDate }) => {
            // ✅ ADD HERE
            const dayShifts = scheduleData[date] || [];
            const hasAnyShift = dayShifts.length > 0;

            return (
              <div key={date} className="day-cell">
                <div className="day-number">
                  {date}/{selectedMonth}/{selectedYear}
                </div>

                {!hasAnyShift ? (
                  <div className="no-shifts full-day">No shifts</div>
                ) : (
                  <div className="shift-slots">
                    {/* Morning */}
                    <div className="shift-slot">
                      {dayShifts.some((s) => s.shift === "Morning") ? (
                        dayShifts
                          .filter((s) => s.shift === "Morning")
                          .map((shift) => (
                            <div
                              key={shift.id}
                              className="shift-block"
                              onClick={() =>
                                handleShiftClick(date, shift, fullDate)
                              }
                            >
                              <div className="shift-time">{shift.time}</div>
                              <div className="shift-count">
                                {shift.staff.length} staff
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="no-shift-slot">No shifts</div>
                      )}
                    </div>

                    {/* Evening */}
                    <div className="shift-slot">
                      {dayShifts.some((s) => s.shift === "Evening") ? (
                        dayShifts
                          .filter((s) => s.shift === "Evening")
                          .map((shift) => (
                            <div
                              key={shift.id}
                              className="shift-block"
                              onClick={() =>
                                handleShiftClick(date, shift, fullDate)
                              }
                            >
                              <div className="shift-time">{shift.time}</div>
                              <div className="shift-count">
                                {shift.staff.length} staff
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="no-shift-slot">No shifts</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Create Shift Modal ===== */}
      {showDatePicker && (
        <div className="modal-overlay">
          <div className="create-shift-modal">
            <h3>Create Shift</h3>

            <input
              type="date"
              value={newShiftDate}
              onChange={(e) => setNewShiftDate(e.target.value)}
            />

            <select
              value={newShiftType}
              onChange={(e) => setNewShiftType(e.target.value)}
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>

            <div className="create-shift-actions">
              <button onClick={() => setShowDatePicker(false)}>Cancel</button>
              <button onClick={handleCreateShift} disabled={isCreatingShift}>
                {isCreatingShift ? "Adding..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Shift Detail ===== */}
      {showShiftDetailModal && (
        <div className="modal-overlay">
          <div className="shift-detail-modal">
            <ShiftDetail
              shift={selectedShiftForDetail}
              onClose={() => setShowShiftDetailModal(false)}
              onShiftUpdate={() => {
                setShowShiftDetailModal(false);
                setRefreshKey((prev) => prev + 1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftView;
