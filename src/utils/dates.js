import { format, addDays, parseISO } from "date-fns";

/**
 * buildMonthWindow(year, month)
 * month: 1..12 (eg. 11 for Nov)
 * returns array of ISO 'yyyy-MM-dd' strings from 26(prev month) to 25(this month)
 */
export function buildMonthWindow(year, month) {
  const m = month;
  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? year - 1 : year;
  const start = new Date(prevYear, prevMonth - 1, 26);
  const end = new Date(year, m - 1, 25);

  const days = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(format(d, "yyyy-MM-dd"));
  return days;
}

export function dayNumber(isoDate) {
  return format(parseISO(isoDate), "dd");
}

export function isSunday(isoDate) {
  return parseISO(isoDate).getDay() === 0;
}
