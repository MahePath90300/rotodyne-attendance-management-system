// shared/attendanceCycle.js

export const ATTENDANCE_CYCLES = {
  // =====================
  // 26 → 25 (default)
  // =====================
  DEFAULT_26_25: {
    startDay: 26,
    type: "CROSS_MONTH",
    label: (year, month) => {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      return `26/${prevMonth}/${prevYear} – 25/${month}/${year}`;
    },
    buildRange(year, month) {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;

      return {
        start: new Date(prevYear, prevMonth - 1, 26),
        end: new Date(year, month - 1, 25),
      };
    },
  },

  // =====================
  // 1 → End of month
  // =====================
  CALENDAR_1_EOM: {
    startDay: 1,
    type: "CALENDAR",
    label: (year, month) => {
      const lastDay = new Date(year, month, 0).getDate();
      return `1/${month}/${year} – ${lastDay}/${month}/${year}`;
    },
    buildRange(year, month) {
      return {
        start: new Date(year, month - 1, 1),
        end: new Date(year, month, 0),
      };
    },
  },

  // =====================
  // ✅ JPL: 21 → 20
  // =====================
  JPL_21_20: {
    startDay: 21,
    type: "CROSS_MONTH",
    label: (year, month) => {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;

      return `21/${prevMonth}/${prevYear} – 20/${month}/${year}`;
    },
    buildRange(year, month) {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;

      return {
        start: new Date(prevYear, prevMonth - 1, 21),
        end: new Date(year, month - 1, 20),
      };
    },
  },
};


/**
 * Site → Cycle mapping
 */
export const SITE_ATTENDANCE_CYCLE = {
  // NTPC (default)
  GADARWARA: "DEFAULT_26_25",
  KANIHA: "DEFAULT_26_25",
  DADRI: "DEFAULT_26_25",

  // New sites
  "NALCO DAMANJODI(0405)": "CALENDAR_1_EOM",
  IOCLGJBS: "CALENDAR_1_EOM",
  HALDIA9426: "CALENDAR_1_EOM",
  IOCPANIPAT: "CALENDAR_1_EOM",
  NABINAGAR: "CALENDAR_1_EOM",
  DAMANOH9252: "CALENDAR_1_EOM",
  WANAKBORI: "CALENDAR_1_EOM",
  IEPL9308: "CALENDAR_1_EOM",
  IEPLOPER: "CALENDAR_1_EOM",
  MECONNMDC: "CALENDAR_1_EOM",
  RCFTHAL9253: "CALENDAR_1_EOM",

  "JPLSBOP 9541": "JPL_21_20",
  JPLSTG9540: "JPL_21_20",
};

/**
 * Resolver (safe)
 */
export function resolveAttendanceCycle(siteId) {
  const key = SITE_ATTENDANCE_CYCLE[siteId] || "DEFAULT_26_25";
  return ATTENDANCE_CYCLES[key];
}
