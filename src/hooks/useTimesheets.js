import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { startOfMonth, endOfMonth, format } from "date-fns";

export const useTimesheets = (selectedDate) => {
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Fetch employees
    const employeesQuery = collection(db, "employees");
    const unsubscribeEmployees = onSnapshot(employeesQuery, (snapshot) => {
      const employeesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesData);
    });

    // Fetch timesheets for selected month
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const timesheetsQuery = query(
      collection(db, "timesheets"),
      where("date", ">=", monthStart),
      where("date", "<=", monthEnd)
    );

    const unsubscribeTimesheets = onSnapshot(timesheetsQuery, (snapshot) => {
      const timesheetsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
      }));
      setTimesheets(timesheetsData);
    });

    return () => {
      unsubscribeEmployees();
      unsubscribeTimesheets();
    };
  }, [selectedDate]);

  return { employees, timesheets };
};
