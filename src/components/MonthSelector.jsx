import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { nl } from "date-fns/locale";

const MonthSelector = ({ onMonthChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleMonthChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
    onMonthChange(newDate);
  };

  const handlePrev = () => {
    const newDate = subMonths(selectedDate, 1);
    setSelectedDate(newDate);
    onMonthChange(newDate);
  };

  const handleNext = () => {
    const newDate = addMonths(selectedDate, 1);
    setSelectedDate(newDate);
    onMonthChange(newDate);
  };

  return (
    <div className="month-selector">
      <button className="chevron-button" onClick={handlePrev}>
        <svg className="chevron-icon" viewBox="0 0 24 24">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
        </svg>
      </button>

      <input
        type="month"
        value={format(selectedDate, "yyyy-MM", { locale: nl })} // Set Dutch locale
        onChange={handleMonthChange}
      />

      <button className="chevron-button-right" onClick={handleNext}>
        <svg className="chevron-icon" viewBox="0 0 24 24">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
        </svg>
      </button>
    </div>
  );
};

export default MonthSelector;
