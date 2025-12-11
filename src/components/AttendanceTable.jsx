import React, { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import api from "../api/axios";
import { useAuth } from "../context/AuthenticationContext.jsx";
import LogoutButton from "./LogoutButton.jsx";
import Legend from "./Legend";
import * as notify from "../utils/notify";

function buildMonthDays(year, month) {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  const start = new Date(prevYear, prevMonth - 1, 26);
  const end = new Date(year, month - 1, 25);

  const days = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const iso = format(d, "yyyy-MM-dd"); // local-safe, no timezone shift
    days.push({
      iso,
      dayNum: d.getDate(),
      dow: d.toLocaleDateString("en-IN", { weekday: "short" }),
      isSunday: d.getDay() === 0,
    });
  }
  return days;
}

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
}) {
  const days = useMemo(() => buildMonthDays(year, month), [year, month]);
  const { user } = useAuth();
  const role = (user?.role || "VIEWER").toUpperCase();

  const [statusEdits, setStatusEdits] = useState({});
  const [otEdits, setOtEdits] = useState({});
  const [saving, setSaving] = useState(false);

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
    { val: "PP", label: "PP" }, // full-day present
    { val: "P", label: "P" }, // half-day present
    { val: "AA", label: "AA" }, // full-day absent
    { val: "A", label: "A" }, // half-day absent
    { val: "LL", label: "LL" }, // leave
    { val: "CC", label: "CC" }, // casual leave
    { val: "WW", label: "WW" }, // week-off
  ];

  const HOLIDAY_OPTIONS = [
    { val: "HH", label: "HH" },
    { val: "HW", label: "HW" },
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

  function getEffectiveStatus(empNo, dateIso, isHoliday, isSunday) {
    const stored =
      statusEdits[empNo]?.[dateIso] ?? attendanceMap[empNo]?.[dateIso] ?? "";
    if (stored && String(stored).trim() !== "") return stored;

    // If date is Sunday or a site holiday -> show HH (holiday) by default
    if (isHoliday || isSunday) return "HH";

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

  function handleStatusChange(empNo, dateIso, val, isHoliday, isSunday) {
    // set status first (user intent)
    setStatus(empNo, dateIso, val);

    // If user selected HW on holiday/sunday -> force OT = 8
    if (val === "HW" && (isHoliday || isSunday)) {
      setOT(empNo, dateIso, 8); // overwrite any previous value as per request
      return;
    }

    // If changed to HH (holiday but not working) and previous might be 8 -> set OT to 0
    if (val === "HH" && (isHoliday || isSunday)) {
      // set explicitly to zero so backend persists OT = 0 for wage-sheet conversion
      setOT(empNo, dateIso, 0);
      return;
    }

    // If user changed away from HW to any other (non-HW) and previously we auto-set 8,
    // clear it only if backend did not originally have a value (so we don't wipe real data).
    if (val !== "HW") {
      const prevOt =
        otEdits[empNo] && typeof otEdits[empNo][dateIso] !== "undefined"
          ? otEdits[empNo][dateIso]
          : otMap[empNo]?.[dateIso];

      if (
        Number(prevOt) === 8 &&
        !Object.prototype.hasOwnProperty.call(otMap[empNo] || {}, dateIso)
      ) {
        // delete the auto-filled edit
        setOT(empNo, dateIso, "");
      }
    }
  }

  // === STATS PER EMPLOYEE ===

  const computeRowStats = (empNo) => {
    let otHours = 0;
    let presentDays = 0;
    let leaves = 0;
    let weekOffs = 0;
    let casual = 0;
    let absents = 0;
    let siteHolidays = 0;

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
      } else if (s === "HW" && (isHoliday || isSunday)) {
        otHours += 8;
      }

      // Holiday count logic for wage-sheet HH:
      // Count each Sunday/public holiday only once if worker did NOT do HW.
      if (isHoliday || isSunday) {
        if (s !== "HW") {
          siteHolidays += 1; // count as HH (not worked)
        }
        // if s === "HW" do NOT increment — we've treated that as OT
      }

      // status-based increments (P/PP/A/AA/LL/WW/CC)
      switch (s) {
        case "PP":
          presentDays += 1;
          break;
        case "P":
          presentDays += 0.5;
          break;
        case "AA":
          absents += 1;
          break;
        case "A":
          absents += 0.5;
          break;
        case "LL":
          leaves += 1;
          break;
        case "WW":
          weekOffs += 1;
          break;
        case "CC":
          casual += 1;
          break;
        // DO NOT increment siteHolidays here; handled above
        default:
          break;
      }
    }

    return {
      otHours,
      presentDays,
      leaves,
      weekOffs,
      casual,
      absents,
      totalDaysWorked: totalWorkingDaysInWindow,
      siteHolidays,
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
        totalWeekOffs: stats.weekOffs,
        totalCasualLeaves: stats.casual,
        totalDaysWorked: stats.totalDaysWorked,
        totalCalendarDays: days.length,
        totalHolidays: stats.siteHolidays,
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
  const sortedEmployees = useMemo(
    () =>
      [...employees].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "en", {
          sensitivity: "base",
        })
      ),
    [employees]
  );

  // Supply first, then BOQ (using manpowerType / siteType from collection)
  const { supplyEmployees, boqEmployees } = useMemo(() => {
    const supply = [];
    const boq = [];
    for (const e of sortedEmployees) {
      const type = (e.manpowerType || e.siteType || "").toLowerCase();
      if (type === "boq") boq.push(e);
      else supply.push(e); // default to supply if not explicitly BOQ
    }
    return { supplyEmployees: supply, boqEmployees: boq };
  }, [sortedEmployees]);

  const leftSticky = "sticky left-0 bg-white z-20";
  const headerSticky = "sticky top-0 z-30 bg-amber-50";
  const boqSticky = "sticky top-9 z-30 bg-violet-100";
  let supplySticky = "sticky top-9 z-30 bg-sky-100";
  if (employees.siteType === "BOQ") {
    supplySticky = "";
  }

  const renderEmployeeRows = (emp, rowIndex) => {
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
      <React.Fragment key={empNo}>
        {/* Row 1: status */}
        <tr className="border-b">
          <td
            className={`${leftSticky} border px-2 py-1 bg-white text-center w-10`}
          >
            {rowIndex + 1}
          </td>
          <td
            className={`${leftSticky} border px-2 py-1 bg-white text-center w-24`}
          >
            {emp.empNo}
          </td>
          <td
            className={`${leftSticky} border px-2 py-1 bg-white text-left w-56`}
          >
            {emp.name}
          </td>
          <td className="border px-2 py-1 text-center w-24">
            {emp.designation}
          </td>
          <td className="border px-2 py-1 text-center w-24">{emp.category}</td>
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
            if (isHoliday && s === "HW") {
              bg = "bg-lime-200";
            }
            if (isSunday && s === "HW") {
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
            const options =
              isHoliday || isSunday ? HOLIDAY_OPTIONS : STATUS_OPTIONS;
            const storedS = getStatus(empNo, d.iso); // original stored value (may be "")

            return (
              <td
                key={d.iso}
                className={`border px-1 py-1 w-18 text-center align-middle ${bg}`}
              >
                {editable ? (
                  <select
                    value={storedS || (isHoliday || isSunday ? "HH" : "")}
                    onChange={(e) =>
                      handleStatusChange(
                        empNo,
                        d.iso,
                        e.target.value,
                        isHoliday,
                        isSunday
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
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.leaves || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.casual || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.absents || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.siteHolidays || 0}
          </td>
          <td className="border px-1 py-1 text-center w-14 text-medium">
            {stats.weekOffs || 0}
          </td>
        </tr>

        {/* Row 2: OT / HW hours */}
        <tr className="border-b bg-sky-50/40">
          <td
            className={`${leftSticky} border px-2 py-1 bg-sky-50/40 text-right text-[10px] w-10`}
          ></td>
          <td className={`${leftSticky} border px-2 py-1 bg-sky-50/40`} />
          <td className={`${leftSticky} border px-2 py-1 bg-sky-50/40`} />
          <td className="border px-2 py-1 text-[10px] text-right" colSpan={2}>
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
                className={`border px-1 py-1 w-18 text-center align-middle ${bg}`}
              >
                {editable ? (
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={valueForInput}
                    onChange={(e) => setOT(empNo, d.iso, e.target.value)}
                    className={`w-full min-w-[44px] h-7 text-[13px] leading-tight rounded-md border px-1 text-center appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${otPositive ? "ring-2 ring-amber-400" : ""}`}
                  />
                ) : (
                  <span className="text-[11px]">
                    {
                      // viewer: show explicit value if present (including 0).
                      // if no explicit value and status is HW on holiday/sunday, show 8
                      typeof otRaw !== "undefined"
                        ? otRaw
                        : getEffectiveStatus(
                              empNo,
                              d.iso,
                              isHoliday,
                              isSunday
                            ) === "HW" &&
                            (isHoliday || isSunday)
                          ? 8
                          : ""
                    }
                  </span>
                )}
              </td>
            );
          })}

          {/* OT totals row placeholders – optional extension later */}
          <td className="border px-1 py-1 text-center text-[13px]">
            {stats.otHours}
          </td>
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
            Attendance period: 26/{month === 1 ? 12 : month - 1}/{year} – 25/
            {month}/{year}
          </div>
        </div>
        <LogoutButton />
      </div>

      {/* table */}
      <div className="overflow-auto max-h-[70vh]">
        <table className="min-w-max text-xs border-collapse">
          <thead>
            <tr className={`${headerSticky}`}>
              <th
                className={`${leftSticky} border px-2 py-2 w-10 text-center bg-amber-50`}
              >
                Sl
              </th>
              <th
                className={`${leftSticky} border px-2 py-2 w-24 text-center bg-amber-50`}
              >
                Emp No
              </th>
              <th
                className={`${leftSticky} border px-2 py-2 w-56 text-center bg-amber-50`}
              >
                Name
              </th>
              <th className="border px-2 py-2 w-24 text-center bg-amber-50">
                Designation
              </th>
              <th className="border px-2 py-2 w-24 text-center bg-amber-50">
                Category
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

              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                OT
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                TD
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                PP
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                LL
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                CC
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                AA
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                HH
              </th>
              <th className="border px-2 py-2 w-14 text-center bg-amber-50">
                WW
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Supply first */}
            {supplyEmployees.length > 0 && (
              <tr className={`${supplySticky}`}>
                <td
                  colSpan={6 + days.length + 7}
                  className="bg-sky-100 text-sky-900 font-semibold px-3 py-2 text-sm"
                >
                  Supply Manpower
                </td>
              </tr>
            )}
            {supplyEmployees.map((emp, idx) => renderEmployeeRows(emp, idx))}

            {/* BOQ */}
            {boqEmployees.length > 0 && (
              <tr className={`${boqSticky}`}>
                <td
                  colSpan={6 + days.length + 7}
                  className="bg-violet-100 text-violet-900 font-semibold px-3 py-2 text-sm"
                >
                  BOQ Manpower
                </td>
              </tr>
            )}
            {boqEmployees.map((emp, idx) =>
              renderEmployeeRows(emp, supplyEmployees.length + idx)
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
              0
            ) +
              Object.values(otEdits).reduce(
                (sum, emp) => sum + Object.keys(emp).length,
                0
              )}
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
