import { resolveAttendanceCycle } from "../config/attendanceCycle";

export function resolveInitialAttendanceMonth(siteId) {
  const today = new Date();
  const cycle = resolveAttendanceCycle(siteId);

  let year = today.getFullYear();
  let month = today.getMonth() + 1; // 1–12

  // 🔥 ONLY for 26–25 cycle
  if (cycle.type === "CROSS_MONTH") {
    const day = today.getDate();

    // After 26th → move to next month
    if (day >= 26) {
      month += 1;
      if (month === 13) {
        month = 1;
        year += 1;
      }
    }
  }

  return { year, month };
}
