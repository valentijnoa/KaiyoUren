import { useState } from "react";
import { format, addMonths, subMonths, parseISO, isValid } from "date-fns";

const MonthSelector = ({ onMonthChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const update = (date) => {
    setSelectedDate(date);
    onMonthChange(date);
  };

  const handleMonthChange = (e) => {
    const newDate = parseISO(e.target.value);
    if (isValid(newDate)) update(newDate); // leeg veld negeren i.p.v. crashen
  };

  return (
    <div className="month-selector">
      <button className="chevron-button" onClick={() => update(subMonths(selectedDate, 1))}>
        <svg className="chevron-icon" viewBox="0 0 24 24">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
        </svg>
      </button>

      <input
        type="month"
        value={format(selectedDate, "yyyy-MM")}
        onChange={handleMonthChange}
      />

      <button className="chevron-button-right" onClick={() => update(addMonths(selectedDate, 1))}>
        <svg className="chevron-icon" viewBox="0 0 24 24">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
        </svg>
      </button>
    </div>
  );
};

export default MonthSelector;
