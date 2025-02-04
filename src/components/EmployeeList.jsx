// components/EmployeeList.jsx
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "employees"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEmployees(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleDelete = async (employeeId) => {
    if (window.confirm("Deze werknemer verwijderen?")) {
      try {
        // Delete employee
        await deleteDoc(doc(db, "employees", employeeId));

        // Delete related timesheets
        const timesheetsQuery = query(
          collection(db, "timesheets"),
          where("employeeId", "==", employeeId)
        );
        const snapshot = await getDocs(timesheetsQuery);
        snapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  return (
    <div className="employee-list">
      <h2>Medewerkers</h2>
      {employees.map((employee) => (
        <div key={employee.id} className="employee-item">
          <span>{employee.name}</span>
          <button
            onClick={() => handleDelete(employee.id)}
            className="delete-button"
          >
            Verwijderen
          </button>
        </div>
      ))}
    </div>
  );
};

export default EmployeeList;
