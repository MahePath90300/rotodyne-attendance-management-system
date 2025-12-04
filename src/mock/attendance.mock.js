// src/mock/attendance.mock.js

/**
 * --- MOCK FILE FOR UI TESTING ---
 * Contains:
 * - Days list (26th previous → 25th next)
 * - Holidays
 * - Employees (Supply + BOQ)
 * - Attendance map for each employee
 */

function generateMonthDays(year, month) {
  const start = new Date(year, month - 1, 26);  // start: prev month 26
  const end = new Date(year, month, 25);        // end: next month 25

  const days = [];
  const cur = new Date(start);

  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);

    days.push({
      date: iso,
      day: cur.toLocaleString("en-US", { weekday: "short" }),
      isSunday: cur.getDay() === 0,
    });

    cur.setDate(cur.getDate() + 1);
  }

  return days;
}

// -----------------------------------------
//  MOCK EMPLOYEES (with Designation & Category)
// -----------------------------------------
const employeesSupply = [
  {
    empNo: "14171",
    name: "ABHISHEK AHIROWA",
    designation: "JR.F",
    category: "SSW",
    type: "SUPPLY",
  },
  {
    empNo: "14969",
    name: "SACHIN BHATI",
    designation: "WELDER",
    category: "HSW",
    type: "SUPPLY",
  },
  {
    empNo: "14977",
    name: "RAKESH KUMAR",
    designation: "HELPER",
    category: "USW",
    type: "SUPPLY",
  },
];

const employeesBOQ = [
  {
    empNo: "15610",
    name: "MOHIT SINGH",
    designation: "PAINTER",
    category: "USW",
    type: "BOQ",
  },
  {
    empNo: "15441",
    name: "RAJENDER SINGH",
    designation: "MVF",
    category: "HSW",
    type: "BOQ",
  },
];

// Combine
const allEmployees = [...employeesSupply, ...employeesBOQ];

// -----------------------------------------
//  GENERATE SAMPLE ATTENDANCE FOR EACH EMPLOYEE
// -----------------------------------------
function generateAttendanceMap(days, employees) {
  const map = {};

  employees.forEach((emp) => {
    const empAttendance = {};

    days.forEach((d) => {
      if (d.isSunday) {
        empAttendance[d.date] = "H"; // Holiday/Sunday
      } else {
        const random = Math.random();
        empAttendance[d.date] =
          random < 0.8 ? "PP" : random < 0.9 ? "A" : "OT";
      }
    });

    map[emp.empNo] = empAttendance;
  });

  return map;
}

// -----------------------------------------
//  HOLIDAYS
// -----------------------------------------
const holidays = ["2025-11-09", "2025-11-23"];

// -----------------------------------------
//  DAYS WINDOW FOR SAMPLE (Nov 2025)
// -----------------------------------------
const days = generateMonthDays(2025, 11);

// -----------------------------------------
//  FINAL MOCK OBJECT FOR 2 SITES
// -----------------------------------------
const mockData = {
  DADRI: {
    siteTitle: "NTPC DADRI",
    siteType: "Supply",

    days,
    holidays,
    employees: allEmployees,

    attendanceMap: generateAttendanceMap(days, allEmployees),
  },

  GARADWARA: {
    siteTitle: "NTPC GARADWARA",
    siteType: "BOQ",

    days,
    holidays,
    employees: allEmployees,

    attendanceMap: generateAttendanceMap(days, allEmployees),
  },
};

export default mockData;
