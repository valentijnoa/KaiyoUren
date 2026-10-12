import { eachDayOfInterval, startOfMonth, endOfMonth, format } from "date-fns";
import { nl } from "date-fns/locale";
import { sumHours, formatHours } from "./hours";

// jsPDF is groot; pas laden op het moment dat je echt exporteert.
export const exportMonthPdf = async (employees, timesheets, selectedDate) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const days = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate),
  });
  const key = (d) => format(d, "yyyy-MM-dd");
  const byKey = new Map(timesheets.map((t) => [`${t.employeeId}|${key(t.date)}`, t]));

  const sorted = [...employees].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", "nl", { sensitivity: "base" })
  );

  const head = [["Werknemer", ...days.map((d) => format(d, "d")), "Totaal"]];
  const body = sorted.map((e) => {
    const hours = days.map((d) => byKey.get(`${e.id}|${key(d)}`)?.totalHours);
    return [e.name, ...hours.map((h) => formatHours(h ?? "")), formatHours(sumHours(hours))];
  });

  const title = format(selectedDate, "LLLL yyyy", { locale: nl });
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(14);
  doc.text(`Uren ${title}`, 14, 14);

  autoTable(doc, {
    head,
    body,
    startY: 20,
    margin: { left: 10, right: 10 },
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 1.2, halign: "center", lineColor: [221, 221, 221], lineWidth: 0.1 },
    headStyles: { fillColor: [207, 47, 28], textColor: 255 },
    alternateRowStyles: { fillColor: [238, 241, 246] },
    columnStyles: {
      0: { halign: "left", cellWidth: 32 },
      [days.length + 1]: { fontStyle: "bold", cellWidth: 12 },
    },
  });

  doc.save(`uren-${format(selectedDate, "yyyy-MM")}.pdf`);
};
