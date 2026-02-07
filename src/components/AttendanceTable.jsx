import React, { useMemo, useState, useEffect, useRef } from "react";
import { addDays, format } from "date-fns";
import api from "../api/axios";
import { useAuth } from "../context/AuthenticationContext.jsx";
import LogoutButton from "./LogoutButton.jsx";
import Legend from "./Legend";
import * as notify from "../utils/notify";
import { resolveAttendanceCycle } from "../config/attendanceCycle";

const todayISO = () => format(new Date(), "yyyy-MM-dd");

export default function AttendanceTable({
  siteId,
  siteTitle,
  siteType,
  employees = [],
  attendanceMap = {}, // { empNo: { dateIso: "PP" | "P" | "AA" | "A" | ... } }
  otMap = {}, // { empNo: { dateIso: numberHours } } optional
  holidays = new Set(), // Set of "YYYY-MM-DD"
  year,
  month,
  allowViewerEdit = false,
  onSaved,
  summaryMap = {},
}) {
  const cycle = resolveAttendanceCycle(siteId);
  const days = useMemo(() => {
    const { start, end } = cycle.buildRange(year, month);
    const arr = [];
    for (let d = start; d <= end; d = addDays(d, 1)) {
      arr.push({
        iso: format(d, "yyyy-MM-dd"),
        dayNum: d.getDate(),
        dow: d.toLocaleDateString("en-IN", { weekday: "short" }),
        isSunday: d.getDay() === 0,
      });
    }
    return arr;
  }, [year, month, siteId]);

  const { user } = useAuth();
  const role = (user?.role || "VIEWER").toUpperCase();

  const [statusEdits, setStatusEdits] = useState({});
  const [otEdits, setOtEdits] = useState({});
  const [saving, setSaving] = useState(false);

  const [designationFilter, setDesignationFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const supplyRef = useRef(null);
  const boqRef = useRef(null);

  const supplySentinelRef = useRef(null);
  const boqSentinelRef = useRef(null);

  const [siteDayEdits, setSiteDayEdits] = useState({});
  const [activeOTCell, setActiveOTCell] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const sortedEmployees = useMemo(
    () =>
      [...employees].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "en", {
          sensitivity: "base",
        }),
      ),
    [employees],
  );

  // Supply first, then BOQ (using manpowerType / siteType from collection)
  const filteredEmployees = useMemo(() => {
    return sortedEmployees.filter((emp) => {
      const designationMatch =
        designationFilter === "ALL" || emp.designation === designationFilter;

      const categoryMatch =
        categoryFilter === "ALL" || emp.category === categoryFilter;

      return designationMatch && categoryMatch;
    });
  }, [sortedEmployees, designationFilter, categoryFilter]);

  const { supplyEmployees, boqEmployees } = useMemo(() => {
    const supply = [];
    const boq = [];

    for (const e of filteredEmployees) {
      const type = (e.manpowerType || e.siteType || "").toLowerCase();
      if (type === "boq") boq.push(e);
      else supply.push(e);
    }
    return { supplyEmployees: supply, boqEmployees: boq };
  }, [filteredEmployees]);

  const designationOptions = useMemo(() => {
    const set = new Set(
      sortedEmployees.map((e) => e.designation).filter(Boolean),
    );
    return ["ALL", ...Array.from(set)];
  }, [sortedEmployees]);

  const categoryOptions = useMemo(() => {
    const set = new Set(sortedEmployees.map((e) => e.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [sortedEmployees]);

  useEffect(() => {
    if (!supplySentinelRef.current || !boqSentinelRef.current) return;

    const rootEl = document.querySelector(".attendance-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const section = entry.target.dataset.section;
          if (section === "SUPPLY") setActiveSection("SUPPLY");
          if (section === "BOQ") setActiveSection("BOQ");
        });
      },
      {
        root: rootEl,
        threshold: 0.15,
      },
    );

    observer.observe(supplySentinelRef.current);
    observer.observe(boqSentinelRef.current);

    return () => observer.disconnect();
  }, [filteredEmployees]); // ✅ re-run after filter

  const totalWorkingDaysInWindow = useMemo(() => {
    return days.reduce((acc, d) => {
      const isHoliday = holidays.has(d.iso);
      if (d.isSunday || isHoliday) return acc;
      return acc + 1;
    }, 0);
  }, [days, holidays]);

  const isViewer = role === "VIEWER";

  // === STATUS OPTIONS ===
  // Keep codes short in the cells; descriptions are in Legend.
  const STATUS_OPTIONS = [
    { val: "-", label: "-" },
    { val: "P", label: "P" },
    { val: "A", label: "A" },
    { val: "L", label: "L" }, // leave
    { val: "C Off", label: "C Off" }, // comp off leave
    { val: "WO", label: "WO" }, // week-off
    { val: "WOW", label: "WOW" },
    { val: "HP", label: "HP" }, //half day
  ];

  const SUNDAY_OPTIONS = [
    { val: "WO", label: "WO" },
    { val: "WOW", label: "WOW" },
    { val: "P", label: "P" },
    { val: "A", label: "A" },
  ];

  const HOLIDAY_OPTIONS = [
    { val: "H", label: "H" },
    { val: "HW", label: "HW" },
    { val: "P", label: "P" },
    { val: "A", label: "A" },
  ];

  const canEditStatus = (dateIso) => {
    if (role === "ADMIN") return true;
    if (role === "VIEWER") return allowViewerEdit; // normally false
    if (role === "SITE_ENGINEER") {
      const today = todayISO();
      if (!user.site || user.site.toUpperCase() !== siteId.toUpperCase()) {
        return false;
      }
      return dateIso === today; // only today
    }
    return false;
  };

  const canEditOT = (dateIso) => canEditStatus(dateIso);

  const getStatus = (empNo, dateIso) =>
    statusEdits[empNo]?.[dateIso] ?? attendanceMap[empNo]?.[dateIso] ?? "";

  // returns undefined when no OT stored (preserve ability to detect absence)
  const getOTRaw = (empNo, dateIso) =>
    otEdits[empNo] && typeof otEdits[empNo][dateIso] !== "undefined"
      ? otEdits[empNo][dateIso]
      : otMap[empNo] && typeof otMap[empNo][dateIso] !== "undefined"
        ? otMap[empNo][dateIso]
        : undefined;

  const getOT = (empNo, dateIso) =>
    otEdits[empNo] && typeof otEdits[empNo][dateIso] !== "undefined"
      ? otEdits[empNo][dateIso]
      : otMap[empNo] && typeof otMap[empNo][dateIso] !== "undefined"
        ? otMap[empNo][dateIso]
        : 0;

  function hasExplicitOT(empNo, dateIso) {
    if (
      otEdits[empNo] &&
      Object.prototype.hasOwnProperty.call(otEdits[empNo], dateIso)
    )
      return true;
    if (
      otMap[empNo] &&
      Object.prototype.hasOwnProperty.call(otMap[empNo], dateIso)
    )
      return true;
    return false;
  }

  const getSiteDays = (empNo) =>
    siteDayEdits[empNo] ?? summaryMap?.[empNo]?.siteDays ?? 0;

  function getEffectiveStatus(empNo, dateIso, isHoliday, isSunday) {
    const stored =
      statusEdits[empNo]?.[dateIso] ?? attendanceMap[empNo]?.[dateIso] ?? "";

    if (stored) return stored;

    if (isSunday) return "WO";
    if (isHoliday) return "H";

    return "";
  }

  function setStatus(empNo, dateIso, val) {
    setStatusEdits((prev) => {
      const emp = { ...(prev[empNo] || {}) };
      if (!val) delete emp[dateIso];
      else emp[dateIso] = val;
      return { ...prev, [empNo]: emp };
    });
  }

  function setOT(empNo, dateIso, val) {
    setOtEdits((prev) => {
      const emp = { ...(prev[empNo] || {}) };
      // treat empty string / null as delete
      if (val === "" || val === null || typeof val === "undefined") {
        delete emp[dateIso];
      } else {
        emp[dateIso] = Number(val);
      }
      return { ...prev, [empNo]: emp };
    });
  }

  function handleStatusChange(empNo, dateIso, val) {
    setStatus(empNo, dateIso, val);
  }

  function setSiteDays(empNo, value) {
    setSiteDayEdits((prev) => ({
      ...prev,
      [empNo]: Number(value) || 0,
    }));
  }

  // === STATS PER EMPLOYEE ===

  const computeRowStats = (empNo) => {
    let otHours = 0;
    let presentDays = 0;
    let leaves = 0;
    let weekOffs = 0;
    let absents = 0;
    let siteHolidays = 0;
    let holidayWorkingDays = 0;
    let weekOffWorking = 0;
    let cOffDays = 0;

    for (const d of days) {
      const isHoliday = holidays.has(d.iso);
      const isSunday = d.isSunday;
      const s = getEffectiveStatus(empNo, d.iso, isHoliday, isSunday);

      // OT decision: explicit OT preferred, otherwise HW on holiday/sunday -> 8h
      const backendOtDefined =
        otMap[empNo] && typeof otMap[empNo][d.iso] !== "undefined";
      const editedOtDefined =
        otEdits[empNo] && typeof otEdits[empNo][d.iso] !== "undefined";
      const explicitOt = editedOtDefined
        ? otEdits[empNo][d.iso]
        : backendOtDefined
          ? otMap[empNo][d.iso]
          : undefined;

      if (
        typeof explicitOt !== "undefined" &&
        !Number.isNaN(Number(explicitOt)) &&
        Number(explicitOt) > 0
      ) {
        otHours += Number(explicitOt);
      }

      if (isSunday) {
        if (s === "WO") weekOffs += 1;
        if (s === "WOW") weekOffWorking += 1;
        if (s === "P") presentDays += 1;
        continue;
      }

      if (isHoliday) {
        if (s === "H" || s === "HW") siteHolidays += 1;
        if (s === "HW") holidayWorkingDays += 1;
        if (s === "A") absents += 1;
        if (s === "P") presentDays += 1;
        continue;
      }

      // status-based increments (P/PP/A/AA/LL/WW/CC)
      switch (s) {
        case "P":
          presentDays += 1;
          break;
        case "HP":
          ((presentDays += 0.5), (absents += 0.5));
          break;
        case "A":
          absents += 1;
          break;
        case "L":
          leaves += 1;
          break;
        case "C Off":
          cOffDays += 1;
          break;
        default:
          break;
      }
    }

    return {
      otHours,
      presentDays,
      leaves,
      weekOffs,
      absents,
      totalDaysWorked: totalWorkingDaysInWindow,
      siteHolidays,
      holidayWorkingDays,
      weekOffWorking,
      cOffDays,
    };
  };

  // === Per-cell >2 consecutive absences detection (A / AA per employee) ===
  const flaggedAbsenceCells = useMemo(() => {
    const map = {}; // { empNo: Set(dateIso) }

    for (const emp of employees) {
      const empNo = emp.empNo;
      let streakA = [];
      let streakAA = [];

      for (const d of days) {
        const isHoliday = holidays.has(d.iso);
        const isSunday = d.isSunday;
        const s = getEffectiveStatus(empNo, d.iso, isHoliday, isSunday);

        // Half-day absent
        if (s === "A") {
          streakA.push(d.iso);
        } else {
          streakA = [];
        }

        // Full-day absent
        if (s === "AA") {
          streakAA.push(d.iso);
        } else {
          streakAA = [];
        }

        if (streakA.length >= 3) {
          if (!map[empNo]) map[empNo] = new Set();
          streakA.forEach((iso) => map[empNo].add(iso));
        }
        if (streakAA.length >= 3) {
          if (!map[empNo]) map[empNo] = new Set();
          streakAA.forEach((iso) => map[empNo].add(iso));
        }
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, days, attendanceMap, statusEdits, otEdits]);

  // === SAVE ===
  async function handleSave() {
    const updates = [];
    for (const empNo of Object.keys(statusEdits)) {
      const dates = statusEdits[empNo];
      for (const dateIso of Object.keys(dates)) {
        updates.push({ empNo, date: dateIso, status: dates[dateIso] });
      }
    }

    const otUpdates = [];
    for (const empNo of Object.keys(otEdits)) {
      const dates = otEdits[empNo];
      for (const dateIso of Object.keys(dates)) {
        otUpdates.push({ empNo, date: dateIso, hours: dates[dateIso] });
      }
    }

    // monthly summaries for ALL employees
    const summaries = employees.map((emp) => {
      const stats = computeRowStats(emp.empNo);
      return {
        empNo: emp.empNo,
        siteId,
        year,
        month,
        otHours: stats.otHours,
        totalPresentDays: stats.presentDays,
        totalAbsents: stats.absents,
        totalLeaves: stats.leaves,
        totalWeekOffs: Number(stats.weekOffs) + Number(stats.weekOffWorking),
        totalDaysWorked: stats.totalDaysWorked,
        totalCalendarDays: days.length,
        totalHolidays: stats.siteHolidays,
        totalHoilidayWorkingDays: stats.holidayWorkingDays,
        totalCOffDays: stats.cOffDays,
        siteDays: siteDayEdits[emp.empNo] ?? 0,
      };
    });

    if (!updates.length && !otUpdates.length && !summaries.length) {
      notify.info?.("No changes to save");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/v1/attendance/site/${siteId}/bulk`, {
        updates,
        otUpdates,
        summaries,
      });
      notify.success?.("Saved");
      setStatusEdits({});
      setOtEdits({});
      setSiteDayEdits({});
      if (typeof onSaved === "function") {
        onSaved(); // trigger Dashboard re-fetch
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Save failed";
      notify.error?.(msg);
    } finally {
      setSaving(false);
    }
  }

  // === EMPLOYEE ORDER: sort by name ascending ===
  const stickySl = "sticky left-0 z-[80] bg-white";
  const stickyEmpNo = "sticky left-[40px] z-[80] bg-white";
  const stickyName = "sticky left-[136px] z-[80] bg-white";
  const stickyDesignation = "sticky left-[360px] z-[80] bg-white";
  const stickyCategory = "sticky left-[456px] z-[80] bg-white";

  const leftSticky = "sticky left-0 bg-white z-[60]";
  const headerSticky = "sticky top-0 z-[100] bg-amber-50";

  const renderEmployeeRows = (emp, rowIndex, sectionRef) => {
    const empNo = emp.empNo;
    const flaggedSet = flaggedAbsenceCells[empNo] || new Set();
    const stats = computeRowStats(empNo);

    const manpowerType = (
      emp.manpowerType ||
      emp.siteType ||
      siteType ||
      ""
    ).toUpperCase();

    return (
      <React.Fragment key={emp.empNo}>
        {/* Row 1: status */}
        <tr ref={sectionRef} className="border-b">
          <td className={`${stickySl} border w-10 text-center bg-white`}>
            {rowIndex + 1}
          </td>

          <td className={`${stickyEmpNo} border w-24 bg-white`}>{emp.empNo}</td>

          <td className={`${stickyName} border w-56 bg-white`}>{emp.name}</td>
          <td
            className={`${stickyDesignation} text-center border w-24 bg-white`}
          >
            {emp.designation}
          </td>

          <td className={`${stickyCategory} text-center border w-24 bg-white`}>
            {emp.category}
          </td>
          {/* <td className="border px-2 py-1 text-center w-24">
            {manpowerType || "-"}
          </td> */}

          {days.map((d) => {
            const editable = canEditStatus(d.iso);
            const isHoliday = holidays.has(d.iso);
            const isSunday = d.isSunday;
            const s = getEffectiveStatus(empNo, d.iso, isHoliday, isSunday);
            const isFlagged = flaggedSet.has(d.iso);
            let bg = "bg-emerald-50";

            // Holiday + Sunday styling
            if (isSunday) bg = "bg-amber-100";
            if (isHoliday) bg = "bg-rose-100";

            // Holiday work cell gets special bright highlight
            if (isHoliday && (s === "HW" || s === "P")) {
              bg = "bg-lime-200";
            }
            if (isSunday && (s === "WOW" || s === "P")) {
              bg = "bg-lime-200";
            }

            const flaggedRing = isFlagged
              ? "ring-2 ring-rose-400 ring-offset-1"
              : "";

            const baseTextClass =
              s === "AA" || s === "A"
                ? "border-rose-500 text-rose-700 font-semibold"
                : "border-slate-300 text-slate-800";

            // choose options: if holiday/sunday -> enforce holiday options ONLY
            let options = STATUS_OPTIONS;
            if (isSunday) options = SUNDAY_OPTIONS;
            else if (isHoliday) options = HOLIDAY_OPTIONS;

            const storedS = getStatus(empNo, d.iso); // original stored value (may be "")

            return (
              <td
                key={d.iso}
                className={`border px-1 py-1 min-w-[64px] max-w-[64px] text-center align-middle ${bg}`}
              >
                {editable ? (
                  <select
                    value={storedS || (isHoliday || isSunday ? "WO" : "")}
                    onChange={(e) =>
                      handleStatusChange(
                        empNo,
                        d.iso,
                        e.target.value,
                        isHoliday,
                        isSunday,
                      )
                    }
                    className={`w-full min-w-[48px] h-7 text-[12px] leading-tight rounded-md border px-1 text-center bg-white ${baseTextClass} ${flaggedRing}`}
                  >
                    {options.map((opt, i) => (
                      <option key={opt.val} value={opt.val}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`inline-flex min-w-[32px] h-7 items-center justify-center text-[12px] rounded-md border px-1 ${
                      s ? baseTextClass : "border-slate-200 text-slate-400"
                    } ${flaggedRing}`}
                  >
                    {s || "-"}
                  </span>
                )}
              </td>
            );
          })}

          {/* Totals */}
          <td className="border px-1 py-1 text-center w-14 text-medium"></td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.totalDaysWorked || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.presentDays || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14">
            {role === "ADMIN" || role === "SITE_ENGINEER" ? (
              <input
                type="number"
                min="0"
                step="0.5"
                value={getSiteDays(emp.empNo)}
                onChange={(e) => setSiteDays(emp.empNo, e.target.value)}
                className="w-[50px] h-7 text-xs border rounded text-center"
              />
            ) : (
              getSiteDays(emp.empNo)
            )}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.absents || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.leaves || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.weekOffs || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.weekOffWorking || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.cOffDays || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.siteHolidays || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.holidayWorkingDays || 0}
          </td>
        </tr>

        {/* Row 2: OT / HW hours */}
        <tr className="border-b bg-sky-50/40">
          <td className={`${stickySl} border w-10 bg-sky-50/40`} />
          <td className={`${stickyEmpNo} border w-24 bg-sky-50/40`} />
          <td className={`${stickyName} border w-56 bg-sky-50/40`} />
          <td
            className={`${stickyDesignation} border w-24 bg-sky-50/40 text-right text-[10px]`}
          ></td>
          <td
            className={`${stickyCategory} text-right font-semibold text-[10px] border w-24 bg-sky-50/40`}
          >
            OT Hrs:
          </td>

          {days.map((d) => {
            const otRaw = getOTRaw(empNo, d.iso); // undefined if absent
            const valueForInput = typeof otRaw === "undefined" ? 0 : otRaw;
            const editable = canEditOT(d.iso);
            const isHoliday = holidays.has(d.iso);
            const isSunday = d.isSunday;

            let bg = "bg-emerald-50/40";
            if (isSunday) bg = "bg-amber-50";
            if (isHoliday) bg = "bg-rose-50";

            const otPositive =
              typeof otRaw !== "undefined" ? Number(otRaw) > 0 : false;
            const otViewerPositive =
              typeof otRaw === "undefined"
                ? getEffectiveStatus(empNo, d.iso, isHoliday, isSunday) ===
                    "HW" &&
                  (isHoliday || isSunday)
                : // viewer shows computed 8 for HW; treat that as positive
                  Number(otRaw) > 0;

            return (
              <td
                key={d.iso}
                className={`border px-1 py-1 min-w-[64px] max-w-[64px] text-center align-middle ${bg}`}
              >
                {editable ? (
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={valueForInput}
                    onChange={(e) => setOT(empNo, d.iso, e.target.value)}
                    className={`w-[56px] h-7 text-[13px] leading-tight rounded-md border px-1 text-center appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${otPositive ? "ring-2 ring-amber-400" : ""}`}
                  />
                ) : (
                  <span className="text-[11px]">
                    {
                      // viewer: show explicit value if present (including 0).
                      // if no explicit value and status is HW on holiday/sunday, show 8
                      typeof otRaw !== "undefined" ? otRaw : ""
                    }
                  </span>
                )}
              </td>
            );
          })}

          {/* OT totals row placeholders – optional extension later */}
          <td className="border px-1 py-1 min-w-[64px] max-w-[64px] text-center align-middle">
            {stats.otHours}
          </td>
          <td className="border px-1 py-1 text-center text-[11px]" />
          <td className="border px-1 py-1 text-center text-[11px]" />
          <td className="border px-1 py-1 text-center text-[11px]" />
          <td className="border px-1 py-1 text-center text-[11px]" />
          <td className="border px-1 py-1 text-center text-[11px]" />
          <td className="border px-1 py-1 text-center text-[11px]" />
          <td className="border px-1 py-1 text-center text-[11px]" />
          <td className="border px-1 py-1 text-center text-[11px]" />
          <td className="border px-1 py-1 text-center text-[11px]" />
        </tr>
      </React.Fragment>
    );
  };

  const canSave = role === "ADMIN" || role === "SITE_ENGINEER";

  return (
    <div className="border rounded bg-white flex flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div>
          <div className="text-sm font-semibold">{siteTitle}</div>
          <div className="text-xs text-slate-500">
            Attendance period: {cycle.label(year, month)}
          </div>
        </div>
        <LogoutButton />
      </div>

      {/* table */}
      {activeSection && (
        <div className="sticky top-[44px] z-[90]">
          <div
            className={`px-4 py-2 font-semibold border-b
        ${activeSection === "SUPPLY" ? "bg-sky-100" : "bg-violet-100"}
      `}
          >
            {activeSection === "SUPPLY" ? "Supply Manpower" : "BOQ Manpower"}
          </div>
        </div>
      )}

      <div className="attendance-scroll overflow-auto max-h-[70vh]">
        <table className="min-w-max text-xs border-separate border-spacing-0">
          <thead>
            <tr className={`${headerSticky}`}>
              <th className={`${stickySl} ${headerSticky} border w-10`}>
                Sl No
              </th>
              <th className={`${stickyEmpNo} ${headerSticky} border w-24`}>
                Emp No
              </th>
              <th className={`${stickyName} ${headerSticky} border w-56`}>
                Name
              </th>
              <th
                className={`${stickyDesignation} ${headerSticky} border w-24`}
              >
                <div>Designation</div>
                <select
                  value={designationFilter}
                  onChange={(e) => setDesignationFilter(e.target.value)}
                  className="mt-1 w-full text-[11px] border rounded"
                >
                  {designationOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </th>

              <th className={`${stickyCategory} ${headerSticky} border w-24`}>
                <div>Category</div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mt-1 w-full text-[11px] border rounded"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </th>

              {/* <th className="border px-2 py-2 w-24 text-center bg-amber-50">
                Manpower Type
              </th> */}

              {days.map((d) => {
                const isHoliday = holidays.has(d.iso);
                const isSunday = d.isSunday;
                let bg = "bg-emerald-50";
                if (isSunday) bg = "bg-amber-100";
                if (isHoliday) bg = "bg-rose-100";

                return (
                  <th
                    key={d.iso}
                    className={`border px-1 py-1 w-18 text-center ${bg}`}
                  >
                    <div className="font-semibold">{d.dayNum}</div>
                    <div className="text-[10px] text-slate-600">{d.dow}</div>
                  </th>
                );
              })}

              <th className="w-[64px] text-center bg-amber-50">OT</th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                Total Working Days
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                Total Present Days
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                Site Days
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                Absents
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                Leaves
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                Week Off
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                Week Off Working
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                C Off
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                Holidays
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                Holiday Working
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Supply start marker */}
            <tr
              ref={supplySentinelRef}
              data-section="SUPPLY"
              className="section-sentinel"
            >
              <td colSpan={5 + days.length + 11} className="h-0 p-0" />
            </tr>

            {supplyEmployees.map((emp, idx) => renderEmployeeRows(emp, idx))}

            {/* BOQ start marker */}
            <tr
              ref={boqSentinelRef}
              data-section="BOQ"
              className="section-sentinel"
            >
              <td colSpan={5 + days.length + 11} className="h-0 p-0" />
            </tr>

            {boqEmployees.map((emp, idx) =>
              renderEmployeeRows(emp, supplyEmployees.length + idx),
            )}
          </tbody>
        </table>
      </div>

      {/* bottom bar – hidden for VIEWER */}
      {canSave && (
        <div className="border-t px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Edits:{" "}
            {Object.values(statusEdits).reduce(
              (sum, emp) => sum + Object.keys(emp).length,
              0,
            ) +
              Object.values(otEdits).reduce(
                (sum, emp) => sum + Object.keys(emp).length,
                0,
              ) +
              Object.keys(siteDayEdits).length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStatusEdits({});
                setOtEdits({});
              }}
              disabled={saving}
              className="px-3 py-1 border rounded text-xs"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 bg-sky-600 text-white rounded text-xs"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}

      <div className="px-4">
        <Legend />
      </div>
    </div>
  );
}
