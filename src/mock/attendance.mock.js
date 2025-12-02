import { subDays, format } from "date-fns";

function iso(d) { return format(d, "yyyy-MM-dd"); }

const days = (() => {
  const start = new Date(2025, 10, 26); // Nov 26 2025
  const arr = [];
  for (let i=0;i<30;i++) arr.push(iso(new Date(start.getFullYear(), start.getMonth(), start.getDate()+i)));
  return arr;
})();

const employees_gar = [
  { empNo: "G1001", name: "ADESH KUMAR", designation: "Worker", category: "Supply", site: "GARADWARA", siteType: "Supply" },
  { empNo: "G1002", name: "BACHAN SINGH", designation: "Worker", category: "BOQ", site: "GARADWARA", siteType: "BOQ" },
  { empNo: "G1003", name: "BALVINDER", designation: "Worker", category: "Supply", site: "GARADWARA", siteType: "Supply" },
];

const att_gar = {};
employees_gar.forEach((e, idx) => {
  att_gar[e.empNo] = {};
  days.forEach((d,i) => {
    // set some absences and OT
    if (i % 10 === 1) att_gar[e.empNo][d] = "A";
    else if (i % 7 === 0) att_gar[e.empNo][d] = "PP";
    else att_gar[e.empNo][d] = "P";
  });
});

const holidays_gar = [ days[2], days[15] ];

const employees_dad = [
  { empNo: "D2001", name: "RAJENDER", designation: "Worker", category: "BOQ", site: "DADRI", siteType: "BOQ" },
  { empNo: "D2002", name: "SANTOSH", designation: "Worker", category: "Supply", site: "DADRI", siteType: "Supply" },
];
const att_dad = {};
employees_dad.forEach((e, idx) => {
  att_dad[e.empNo] = {};
  days.forEach((d,i) => {
    if (i % 9 === 2) att_dad[e.empNo][d] = "A";
    else att_dad[e.empNo][d] = "P";
  });
});
const holidays_dad = [ days[4] ];

export default {
  GARADWARA: {
    employees: employees_gar,
    attendanceMap: att_gar,
    holidays: holidays_gar,
    siteTitle: "NTPC GARADWARA",
    siteType: "Supply"
  },
  DADRI: {
    employees: employees_dad,
    attendanceMap: att_dad,
    holidays: holidays_dad,
    siteTitle: "NTPC DADRI",
    siteType: "BOQ"
  }
};
