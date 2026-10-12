import { useMemo } from "react";
import { nl } from "date-fns/locale";
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isAfter,
  isToday,
  startOfDay,
  startOfToday,
} from "date-fns";
import { sumHours, formatHours } from "../utils/hours";

const dayKey = (d) => format(d, "yyyy-MM-dd");

const TimesheetGrid = ({
  employees,
  timesheets,
  selectedDate,
  onCellClick,
}) => {
  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
      }),
    [selectedDate]
  );

  const sortedEmployees = useMemo(
    () =>
      [...employees].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "nl", { sensitivity: "base" })
      ),
    [employees]
  );

  // Eén keer opbouwen i.p.v. per cel de hele lijst doorzoeken.
  const entryMap = useMemo(() => {
    const map = new Map();
    timesheets.forEach((ts) => map.set(`${ts.employeeId}|${dayKey(ts.date)}`, ts));
    return map;
  }, [timesheets]);

  const getEntry = (employeeId, day) =>
    entryMap.get(`${employeeId}|${dayKey(day)}`);

  const handleCellClick = (employee, day) => {
    if (isAfter(startOfDay(day), startOfToday())) return;

    const existing = getEntry(employee.id, day);
    onCellClick(
      existing
        ? { ...existing, employeeName: employee.name, date: day }
        : {
            employeeId: employee.id,
            employeeName: employee.name,
            date: day,
            startTime: "16:00",
            endTime: "17:30",
          }
    );
  };

  return (
    <div className="grid-fit">
      <div
        className="timesheet-grid"
        style={{
          gridTemplateColumns: `minmax(90px, 150px) repeat(${daysInMonth.length}, minmax(0, 1fr)) 56px`,
        }}
      >
        <div className="header-row">
          <div className="header-cell employee-header">Werknemers</div>
          {daysInMonth.map((day) => (
            <div
              key={dayKey(day)}
              className={`header-cell ${
                isToday(day) ? "today" : ""
              }`}
            >
              <div className="day-name">
                {format(day, "EEEEEE", { locale: nl }).toUpperCase()}
              </div>
              <div className="day-number">{format(day, "d")}</div>
            </div>
          ))}
          <div className="header-cell">Totaal</div>
        </div>

        {sortedEmployees.map((employee, rowIndex) => {
          const rowTotal = sumHours(
            daysInMonth.map((d) => getEntry(employee.id, d)?.totalHours)
          );
          return (
            <div key={employee.id} className={`employee-row ${rowIndex % 2 ? "alt" : ""}`}>
              <div className="employee-cell">{employee.name}</div>
              {daysInMonth.map((day) => {
                const isFuture = isAfter(startOfDay(day), startOfToday());
                const entry = getEntry(employee.id, day);
                const hours = entry ? entry.totalHours : "";
                const isEmptyCell = !hours && !isFuture;

                return (
                  <div
                    key={dayKey(day)}
                    className={`hours-cell ${
                      isFuture ? "disabled-cell" : "clickable-cell"
                    } ${isEmptyCell ? "empty-cell" : ""} ${
                      hours ? "filled-cell" : ""
                    }`}
                    onClick={
                      !isFuture ? () => handleCellClick(employee, day) : undefined
                    }
                  >
                    {formatHours(hours) ||
                      (isEmptyCell && <span className="plus-icon">+</span>)}
                  </div>
                );
              })}
              <div className="total-cell">{formatHours(rowTotal)}</div>
            </div>
          );
        })}

      </div>
      {sortedEmployees.length === 0 && (
        <p className="empty-state">
          Nog geen werknemers. Voeg er een toe met "Werknemer Toevoegen".
        </p>
      )}
    </div>
  );
};

export default TimesheetGrid;
