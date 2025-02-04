// components/TimesheetGrid.jsx
import { useState, useMemo } from "react";
import { nl } from "date-fns/locale"; // Import Dutch locale
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isAfter,
  startOfDay,
  startOfToday,
} from "date-fns";

const TimesheetGrid = ({
  employees,
  timesheets,
  selectedDate,
  onCellClick,
}) => {
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const calculateHours = (employeeId, date) => {
    const entry = timesheets.find(
      (ts) =>
        ts.employeeId === employeeId &&
        format(ts.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
    return entry ? entry.totalHours : "";
  };

  const handleCellClick = (employee, day) => {
    const today = startOfToday();
    const cellDate = startOfDay(day);

    if (isAfter(cellDate, today)) {
      return; // Block clicks on future dates
    }

    const existingEntry = timesheets.find(
      (ts) =>
        ts.employeeId === employee.id &&
        format(ts.date, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    );

    onCellClick(
      existingEntry
        ? {
            ...existingEntry,
            id: existingEntry.id, // Ensure we have the document ID
            employeeName: employee.name,
            date: day,
          }
        : {
            employeeId: employee.id,
            employeeName: employee.name,
            date: day,
            startTime: "09:00",
            endTime: "17:30",
            breakMinutes: 30,
            notes: "",
          }
    );
  };

  return (
    <div
      className="timesheet-grid"
      style={{
        gridTemplateColumns: `200px repeat(${daysInMonth.length}, 1fr) 100px`,
      }}
    >
      {/* Header Row */}
      <div className="header-row">
        <div className="header-cell employee-header">Werknemers</div>
        {daysInMonth.map((day) => (
          <div key={day} className="header-cell">
            <div className="day-name">
              {format(day, "EEEEEE", { locale: nl }).toUpperCase()}{" "}
              {/* Use Dutch locale */}
            </div>
            <div className="day-number">{format(day, "d")}</div>
          </div>
        ))}
        <div className="header-cell">Totaal</div>
      </div>

      {/* Employee Rows */}
      {employees.map((employee) => (
        <div key={employee.id} className="employee-row">
          <div className="employee-cell">{employee.name}</div>
          {daysInMonth.map((day) => {
            const isFuture = isAfter(startOfDay(day), startOfToday());
            const hours = calculateHours(employee.id, day);
            const isEmptyCell = !hours && !isFuture;

            return (
              <div
                key={day}
                className={`hours-cell 
                ${isFuture ? "disabled-cell" : "clickable-cell"} 
                ${isEmptyCell ? "empty-cell" : ""}
                ${hours ? "filled-cell" : ""}`}
                onClick={
                  !isFuture ? () => handleCellClick(employee, day) : undefined
                }
              >
                {hours || (isEmptyCell && <span className="plus-icon">+</span>)}
              </div>
            );
          })}
          <div className="total-cell">
            {timesheets
              .filter((ts) => ts.employeeId === employee.id)
              .reduce((sum, ts) => sum + ts.totalHours, 0)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimesheetGrid;
