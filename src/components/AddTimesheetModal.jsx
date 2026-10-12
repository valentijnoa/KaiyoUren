import { useState, useEffect } from "react";
import { collection, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { format, startOfToday, startOfDay } from "date-fns";
import { calculateTotalHours, parseLocalDate } from "../utils/hours";

const EMPTY_FORM = {
  date: "",
  employeeId: "",
  startTime: "16:00",
  endTime: "17:30",
};

const AddTimesheetModal = ({ show, onClose, initialData, employees }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: format(initialData.date, "yyyy-MM-dd"),
        employeeId: initialData.employeeId || "",
        startTime: initialData.startTime || "16:00",
        endTime: initialData.endTime || "17:30",
      });
      setError("");
    }
  }, [initialData]);

  const total = calculateTotalHours(formData.startTime, formData.endTime);

  const validate = () => {
    if (!formData.date) return "Kies een datum";
    if (startOfDay(parseLocalDate(formData.date)) > startOfToday())
      return "Je kunt geen uren toevoegen voor toekomstige datums";
    if (!formData.employeeId) return "Kies een medewerker";
    if (total <= 0)
      return "De eindtijd moet na de starttijd liggen";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setSaving(true);
    try {
      const docId = initialData?.id || doc(collection(db, "timesheets")).id;
      await setDoc(
        doc(db, "timesheets", docId),
        {
          employeeId: formData.employeeId,
          date: parseLocalDate(formData.date),
          startTime: formData.startTime,
          endTime: formData.endTime,
          totalHours: total,
        },
        { merge: true }
      );
      onClose();
    } catch (err) {
      console.error("Error saving timesheet: ", err);
      setError("Opslaan mislukt. Probeer het opnieuw.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    try {
      await deleteDoc(doc(db, "timesheets", initialData.id));
      onClose();
    } catch (err) {
      console.error("Error deleting entry: ", err);
      setError("Verwijderen mislukt. Probeer het opnieuw.");
    }
  };

  if (!show) return null;

  const set = (field) => (e) =>
    setFormData({ ...formData, [field]: e.target.value });

  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        <h2>{initialData?.id ? "Uren Bewerken" : "Uren Toevoegen"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Datum:</label>
            <input
              type="date"
              value={formData.date}
              max={format(new Date(), "yyyy-MM-dd")}
              onChange={set("date")}
              required
            />
          </div>

          <div className="form-group">
            <label>Medewerker:</label>
            <select
              value={formData.employeeId}
              onChange={set("employeeId")}
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
                onChange={set("startTime")}
                required
              />
            </div>
            <div className="form-group">
              <label>Eind Tijd:</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={set("endTime")}
                required
              />
            </div>
          </div>

          <p className="total-preview">
            Totaal: <strong>{total > 0 ? `${total}`.replace(".", ",") : "0"} uur</strong>
          </p>

          {error && <div className="error-message">{error}</div>}

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
            <button type="submit" disabled={saving}>
              Opslaan
            </button>
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
