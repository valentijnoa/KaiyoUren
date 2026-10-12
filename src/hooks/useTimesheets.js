import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { startOfMonth, endOfMonth } from "date-fns";

export const useTimesheets = (selectedDate) => {
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");

  // Werknemers hoeven maar één keer geladen te worden, niet bij elke maandwissel.
  useEffect(() => {
    return onSnapshot(
      collection(db, "employees"),
      (snapshot) =>
        setEmployees(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error(err);
        setError("Werknemers laden mislukt.");
      }
    );
  }, []);

  const monthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`;

  useEffect(() => {
    const q = query(
      collection(db, "timesheets"),
      where("date", ">=", startOfMonth(selectedDate)),
      where("date", "<=", endOfMonth(selectedDate))
    );
    return onSnapshot(
      q,
      (snapshot) => {
        setError("");
        setTimesheets(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            date: d.data().date.toDate(),
          }))
        );
      },
      (err) => {
        console.error(err);
        setError("Uren laden mislukt.");
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  return { employees, timesheets, error };
};
