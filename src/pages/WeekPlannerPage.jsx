import { useState, useEffect } from "react";
import { collection, doc, onSnapshot, setDoc, deleteField } from "firebase/firestore";
import { startOfWeek, addWeeks, subWeeks, addDays, format } from "date-fns";
import { nl } from "date-fns/locale";
import { db } from "../firebase";
import WeekPlannerGrid from "../components/WeekPlannerGrid";
import { buildWeekMessage, openWhatsApp } from "../utils/whatsapp";

const explain = (err, fallback) =>
  err?.code === "permission-denied"
    ? "Geen toegang tot 'schedules': deploy de Firestore rules (firebase deploy --only firestore:rules)."
    : `${fallback} (${err?.code || "onbekende fout"})`;

const monday = (d) => startOfWeek(d, { weekStartsOn: 1 });

const WeekPlannerPage = () => {
  const [weekStart, setWeekStart] = useState(() => monday(new Date()));
  const [employees, setEmployees] = useState([]);
  const [entries, setEntries] = useState({});
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const weekId = format(weekStart, "yyyy-MM-dd"); // doc-id = maandag van de week

  useEffect(
    () =>
      onSnapshot(collection(db, "employees"), (snap) =>
        setEmployees(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
    []
  );

  useEffect(() => {
    setEntries({});
    return onSnapshot(
      doc(db, "schedules", weekId),
      (snap) => {
        setError("");
        setEntries(snap.exists() ? snap.data().entries || {} : {});
      },
      (err) => {
        console.error(err);
        setError(explain(err, "Planning laden mislukt"));
      }
    );
  }, [weekId]);

  const handleSaveCell = async (employeeId, dayKey, slot) => {
    try {
      await setDoc(
        doc(db, "schedules", weekId),
        { entries: { [employeeId]: { [dayKey]: slot ?? deleteField() } } },
        { merge: true }
      );
    } catch (err) {
      console.error(err);
      setError(explain(err, "Opslaan mislukt"));
    }
  };

  const message = buildWeekMessage(weekStart, employees, entries);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Kopiëren mislukt.");
    }
  };

  return (
    <div className="timesheet-page">
      <div className="header">
        <h1>Weekplanning</h1>
        <div className="controls">
          <div className="week-selector">
            <button onClick={() => setWeekStart(subWeeks(weekStart, 1))}>‹</button>
            <span>
              Week {format(weekStart, "I")} · {format(weekStart, "d MMM", { locale: nl })} –{" "}
              {format(addDays(weekStart, 6), "d MMM yyyy", { locale: nl })}
            </span>
            <button onClick={() => setWeekStart(addWeeks(weekStart, 1))}>›</button>
            <button onClick={() => setWeekStart(monday(new Date()))}>Vandaag</button>
          </div>
          <div className="button-group">
            <button onClick={() => openWhatsApp(message)} disabled={employees.length === 0}>
              Deel via WhatsApp
            </button>
            <button onClick={copyMessage} disabled={employees.length === 0}>
              {copied ? "Gekopieerd!" : "Kopieer tekst"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <WeekPlannerGrid
        employees={employees}
        entries={entries}
        weekStart={weekStart}
        onSaveCell={handleSaveCell}
      />

      <details className="message-preview">
        <summary>Voorbeeld van het bericht</summary>
        <pre>{message}</pre>
      </details>
    </div>
  );
};

export default WeekPlannerPage;
