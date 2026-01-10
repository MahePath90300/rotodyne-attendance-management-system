import { format, addDays, parseISO } from "date-fns";

/**
 * buildMonthWindow(year, month)
 * month: 1..12 (eg. 11 for Nov)
 * returns array of ISO 'yyyy-MM-dd' strings from 26(prev month) to 25(this month)
 */
export function buildMonthWindow(year, month, { mode = "NTPC" } = {}) {
  let startDate, endDate;

  if (mode === "CALENDAR") {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0); // last day
  } else {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    startDate = new Date(prevYear, prevMonth - 1, 26);
    endDate = new Date(year, month - 1, 25);
  }

  const days = [];
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }

  return days;
}

export function dayNumber(isoDate) {
  return format(parseISO(isoDate), "dd");
}

export function isSunday(isoDate) {
  return parseISO(isoDate).getDay() === 0;
}
