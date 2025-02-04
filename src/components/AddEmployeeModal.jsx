import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const AddEmployeeModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "employees"), formData);
      onClose();
    } catch (error) {
      console.error("Error adding employee: ", error);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Employee</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="modal-actions">
            <button type="submit">Add Employee</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
