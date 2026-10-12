import { parseISO } from "date-fns";

// Totaal aantal gewerkte uren (eind - start), afgerond op 2 decimalen.
export const calculateTotalHours = (startTime, endTime) => {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const minutes = endH * 60 + endM - (startH * 60 + startM);
  return Math.round((minutes / 60) * 100) / 100;
};

// Optelsom zonder floating point ruis (8.5 + 8 = 16.5, niet 16.499999).
export const sumHours = (values) =>
  Math.round(values.reduce((sum, v) => sum + (Number(v) || 0), 0) * 100) / 100;

// Nederlandse notatie: 8,5
export const formatHours = (value) =>
  value === "" || value == null
    ? ""
    : new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 2 }).format(value);

// "2026-10-12" -> lokale datum (new Date("2026-10-12") geeft UTC en kan een dag opschuiven)
export const parseLocalDate = (isoString) => parseISO(isoString);
