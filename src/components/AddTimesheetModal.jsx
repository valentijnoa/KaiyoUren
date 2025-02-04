import { useState, useEffect } from "react";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { format, isAfter, startOfToday } from "date-fns";

const AddTimesheetModal = ({ show, onClose, initialData, employees }) => {
  const [formData, setFormData] = useState({
    date: "",
    employeeId: "",
    startTime: "09:00",
    endTime: "17:30",
  });

  const [dateError, setDateError] = useState("");

  const validateDate = (dateString) => {
    const selectedDate = new Date(dateString);
    const today = new Date();

    // Reset time components for accurate comparison
    const selectedDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (selectedDay > todayDay) {
      setDateError("Cannot add hours for future dates");
      return false;
    }

    setDateError("");
    return true;
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: format(initialData.date, "yyyy-MM-dd"),
        employeeId: initialData.employeeId,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
      });
    }
  }, [initialData]);

  const calculateTotalHours = () => {
    const [startH, startM] = formData.startTime.split(":").map(Number);
    const [endH, endM] = formData.endTime.split(":").map(Number);
    return endH - startH + (endM - startM) / 60;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDate(formData.date)) return;
    try {
      const docId = initialData?.id || doc(collection(db, "timesheets")).id;

      await setDoc(
        doc(db, "timesheets", docId),
        {
          ...formData,
          date: new Date(formData.date),
          totalHours: calculateTotalHours(formData),
          employeeId: formData.employeeId,
        },
        { merge: true }
      );

      onClose();
    } catch (error) {
      console.error("Error saving timesheet: ", error);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    try {
      await deleteDoc(doc(db, "timesheets", initialData.id));
      onClose();
    } catch (error) {
      console.error("Error deleting entry: ", error);
    }
  };

  if (!show) return null;

  return (
    <div className={`modal-overlay ${show ? "show" : ""}`}>
      <div className="modal-content">
        <h2>{initialData?.id ? "Uren Bewerken" : "Uren Toevoegen"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Datum:</label>
            <input
              type="date"
              value={formData.date}
              max={format(new Date(), "yyyy-MM-dd")} // Restrict calendar picker
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                validateDate(e.target.value);
              }}
              required
            />
            {dateError && <div className="error-message">{dateError}</div>}
          </div>

          <div className="form-group">
            <label>Medewerker:</label>
            <select
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              disabled={!!initialData?.id}
              required
            >
              <option value="">Selecteer Medewerker</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="time-inputs">
            <div className="form-group">
              <label>Start Tijd:</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Eind Tijd:</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            {initialData?.id && (
              <button
                type="button"
                className="delete-button"
                onClick={() => {
                  if (
                    window.confirm(
                      "Weet je zeker dat je dit item wilt verwijderen?"
                    )
                  ) {
                    handleDelete();
                  }
                }}
              >
                Verwijderen
              </button>
            )}
            <button type="submit">Opslaan</button>
            <button type="button" onClick={onClose}>
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTimesheetModal;
