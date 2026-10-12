import { useState, useEffect, useMemo } from "react";
import { format, addDays, isToday } from "date-fns";
import { nl } from "date-fns/locale";

// Eén invoercel (alleen starttijd; de eindtijd vul je achteraf zelf in bij de uren).
// Lokale state zodat typen niet hapert terwijl Firestore bijwerkt; opslaan bij het verlaten van de cel.
const PlannerCell = ({ slot, onSave }) => {
  const [start, setStart] = useState(slot?.start || "");

  useEffect(() => {
    setStart(slot?.start || "");
  }, [slot?.start]);

  const commit = () => {
    if (!start) {
      if (slot) onSave(null); // leeg = vrij
    } else if (start !== slot?.start) {
      onSave({ start });
    }
  };

  return (
    <div className={`planner-cell ${start ? "planned" : ""}`}>
      <input
        type="time"
        value={start}
        onChange={(ev) => setStart(ev.target.value)}
        onBlur={commit}
        aria-label="Starttijd"
      />
    </div>
  );
};

const WeekPlannerGrid = ({ employees, entries, weekStart, onSaveCell }) => {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const sorted = useMemo(
    () => [...employees].sort((a, b) => (a.name || "").localeCompare(b.name || "", "nl", { sensitivity: "base" })),
    [employees]
  );

  if (sorted.length === 0)
    return <p className="empty-state">Nog geen werknemers. Voeg ze toe bij "Medewerkers".</p>;

  return (
    <div className="grid-scroll">
      <div className="planner-grid">
        <div className="header-cell employee-header">Werknemers</div>
        {days.map((d) => (
          <div key={format(d, "yyyy-MM-dd")} className={`header-cell ${isToday(d) ? "today" : ""}`}>
            <div className="day-name">{format(d, "EEEEEE", { locale: nl }).toUpperCase()}</div>
            <div className="day-number">{format(d, "d MMM", { locale: nl })}</div>
          </div>
        ))}

        {sorted.map((emp, rowIndex) => (
          <div key={emp.id} className={`planner-row ${rowIndex % 2 ? "alt" : ""}`}>
            <div className="employee-cell">{emp.name}</div>
            {days.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              return (
                <PlannerCell
                  key={key}
                  slot={entries?.[emp.id]?.[key]}
                  onSave={(slot) => onSaveCell(emp.id, key, slot)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekPlannerGrid;
