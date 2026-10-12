import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const AddEmployeeModal = ({ show, onClose, employees = [] }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const close = () => {
    setName("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (employees.some((emp) => emp.name?.toLowerCase() === trimmed.toLowerCase())) {
      setError("Er bestaat al een werknemer met deze naam");
      return;
    }
    try {
      await addDoc(collection(db, "employees"), { name: trimmed });
      close();
    } catch (err) {
      console.error("Error adding employee: ", err);
      setError("Toevoegen mislukt. Probeer het opnieuw.");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Werknemer Toevoegen</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Volledige naam:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="submit">Toevoegen</button>
            <button type="button" onClick={close}>
              Annuleren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
