import { useState } from "react";
import { useTimesheets } from "../hooks/useTimesheets";
import MonthSelector from "../components/MonthSelector";
import TimesheetGrid from "../components/TimesheetGrid";
import AddTimesheetModal from "../components/AddTimesheetModal";
import AddEmployeeModal from "../components/AddEmployeeModal";
import { exportMonthPdf } from "../utils/exportPdf";

const TimesheetPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const { employees, timesheets, error } = useTimesheets(selectedDate);
  const [editingEntry, setEditingEntry] = useState(null);

  const handleAddEntry = () => {
    setEditingEntry({
      date: new Date(),
      employeeId: "",
      startTime: "16:00",
      endTime: "17:30",
    });
  };

  return (
    <div className="timesheet-page">
      <div className="header">
        <h1>Medewerker UrenRegistratie</h1>
        <div className="controls">
          <MonthSelector onMonthChange={setSelectedDate} />
          <div className="button-group">
            <button onClick={handleAddEntry}>Uren Toevoegen</button>
            <button onClick={() => setShowEmployeeModal(true)}>
              Werknemer Toevoegen
            </button>
            <button
              onClick={() => exportMonthPdf(employees, timesheets, selectedDate)}
              disabled={employees.length === 0}
            >
              Exporteer PDF
            </button>
          </div>
        </div>
      </div>

      <AddEmployeeModal
        show={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        employees={employees}
      />

      {error && <div className="error-message">{error}</div>}

      <TimesheetGrid
        employees={employees}
        timesheets={timesheets}
        selectedDate={selectedDate}
        onCellClick={setEditingEntry}
      />

      <AddTimesheetModal
        show={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        initialData={editingEntry}
        employees={employees}
      />
    </div>
  );
};

export default TimesheetPage;
