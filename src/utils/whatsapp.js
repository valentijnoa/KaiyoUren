import { format, addDays } from "date-fns";
import { nl } from "date-fns/locale";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Bouwt een WhatsApp-bericht (met *vet*) per dag, op volgorde van de week.
export const buildWeekMessage = (weekStart, employees, entries) => {
  const weekEnd = addDays(weekStart, 6);
  const lines = [
    `*Planning week ${format(weekStart, "I")}* (${format(weekStart, "d MMM", { locale: nl })} – ${format(weekEnd, "d MMM", { locale: nl })})`,
    "",
  ];

  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const key = format(day, "yyyy-MM-dd");
    const working = employees
      .map((e) => ({ name: e.name, slot: entries?.[e.id]?.[key] }))
      .filter((x) => x.slot?.start)
      .sort((a, b) => a.slot.start.localeCompare(b.slot.start) || a.name.localeCompare(b.name, "nl"));

    lines.push(`*${cap(format(day, "EEEE d MMMM", { locale: nl }))}*`);
    if (working.length === 0) lines.push("_Niemand ingepland_");
    else working.forEach((w) => lines.push(`• ${w.name}: ${w.slot.start}`));
    lines.push("");
  }
  return lines.join("\n").trim();
};

export const openWhatsApp = (text) =>
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
