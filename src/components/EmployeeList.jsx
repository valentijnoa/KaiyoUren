import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import AddEmployeeModal from "./AddEmployeeModal";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, "employees"), (snapshot) => {
      setEmployees(
        snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.name || "").localeCompare(b.name || "", "nl"))
      );
    });
  }, []);

  const handleDelete = async (employee) => {
    if (
      !window.confirm(
        `${employee.name} verwijderen? Alle bijbehorende uren worden ook verwijderd.`
      )
    )
      return;
    try {
      const snapshot = await getDocs(
        query(collection(db, "timesheets"), where("employeeId", "==", employee.id))
      );
      // Eerst de uren, dan pas de werknemer; zo blijven er geen wezen achter bij een fout.
      // Firestore staat max. 500 writes per batch toe.
      const refs = snapshot.docs.map((d) => d.ref);
      for (let i = 0; i < refs.length; i += 450) {
        const batch = writeBatch(db);
        refs.slice(i, i + 450).forEach((r) => batch.delete(r));
        await batch.commit();
      }
      const last = writeBatch(db);
      last.delete(doc(db, "employees", employee.id));
      await last.commit();
      setError("");
    } catch (err) {
      console.error("Error deleting:", err);
      setError("Verwijderen mislukt. Probeer het opnieuw.");
    }
  };

  return (
    <div className="employee-list">
      <div className="employee-list-header">
        <h2>Medewerkers</h2>
        <button onClick={() => setShowAdd(true)}>Werknemer Toevoegen</button>
      </div>
      <AddEmployeeModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        employees={employees}
      />
      {error && <div className="error-message">{error}</div>}
      {employees.length === 0 && <p className="empty-state">Nog geen werknemers.</p>}
      {employees.map((employee) => (
        <div key={employee.id} className="employee-item">
          <span>{employee.name}</span>
          <button onClick={() => handleDelete(employee)} className="delete-button">
            Verwijderen
          </button>
        </div>
      ))}
    </div>
  );
};

export default EmployeeList;
