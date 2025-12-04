import React, { useMemo, useState } from "react";
import { addDays } from "date-fns";
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
    const iso = d.toISOString().slice(0, 10);
    days.push({
      iso,
      dayNum: d.getDate(),
      dow: d.toLocaleDateString("en-IN", { weekday: "short" }),
      isSunday: d.getDay() === 0,
    });
  }
  return days;
}

export default function AttendanceTable({
  siteId,
  siteTitle,
  siteType,
  employees = [],
  attendanceMap = {}, // { empNo: { dateIso: "PP" | "P" | "AA" | "A" | ... } }
  otMap = {}, // { empNo: { dateIso: numberHours } } optional
  holidays = new Set(),
  year,
  month,
  allowViewerEdit = false,
}) {
  const days = useMemo(() => buildMonthDays(year, month), [year, month]);
  const { user } = useAuth();
  const role = (user?.role || "VIEWER").toUpperCase();

  // edits for status & OT
  const [statusEdits, setStatusEdits] = useState({});
  const [otEdits, setOtEdits] = useState({});
  const [saving, setSaving] = useState(false);

  // status rules:
  // PP = full-day present; P = half-day present
  // AA = full-day absent; A = half-day absent
  const STATUS_OPTIONS = [
    { val: "-", label: "-" },
    { val: "P", label: "P" }, // half-day present
    { val: "PP", label: "PP" }, // full-day present
    { val: "A", label: "A" }, // half-day absent
    { val: "AA", label: "AA" }, // full-day absent
    { val: "HW", label: "HW" }, // holiday work
    { val: "LL", label: "LL" }, // leave
  ];

  const canEditStatus = (dateIso) => {
    if (role === "ADMIN") return true;
    if (role === "VIEWER") return allowViewerEdit;
    if (role === "SITE_ENGINEER") {
      const today = new Date().toISOString().slice(0, 10);
      if (user.site && user.site.toUpperCase() !== siteId.toUpperCase())
        return false;
      return dateIso === today;
    }
    return false;
  };

  const canEditOT = (dateIso) => canEditStatus(dateIso);

  const getStatus = (empNo, dateIso) =>
    statusEdits[empNo]?.[dateIso] ??
    attendanceMap[empNo]?.[dateIso] ??
    "";

  const getOT = (empNo, dateIso) =>
    otEdits[empNo]?.[dateIso] ?? otMap[empNo]?.[dateIso] ?? "";

  /** cells with >2 consecutive absences (A / AA / AAA…) */
  const flaggedAbsentCells = useMemo(() => {
    const result = {}; // empNo -> Set(dateIso)

    for (const e of employees) {
      const absences = days.map((d) => {
        const s = getStatus(e.empNo, d.iso);
        return /^A+$/.test(s); // any run of A's counts
      });

      const flaggedDates = new Set();
      let consec = 0;

      for (let i = 0; i < days.length; i++) {
        if (absences[i]) {
          consec++;
          if (consec > 2) {
            // mark current and previous 2 (and they will stay marked as consec grows)
            for (let j = i - 2; j <= i; j++) {
              flaggedDates.add(days[j].iso);
            }
          }
        } else {
          consec = 0;
        }
      }

      if (flaggedDates.size) {
        result[e.empNo] = flaggedDates;
      }
    }

    return result;
  }, [employees, days, attendanceMap, statusEdits]);

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
      if (val === "" || val == null) {
        delete emp[dateIso];
      } else {
        emp[dateIso] = Number(val);
      }
      return { ...prev, [empNo]: emp };
    });
  }

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
        otUpdates.push({ empNo, date: dateIso, hours: otEdits[empNo][dateIso] });
      }
    }

    if (!updates.length && !otUpdates.length) {
      notify.info?.("No changes to save");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/v1/attendance/site/${siteId}/bulk`, {
        updates,
        otUpdates,
      });
      notify.success?.("Saved");
      setStatusEdits({});
      setOtEdits({});
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Save failed";
      notify.error?.(msg);
    } finally {
      setSaving(false);
    }
  }

  const leftSticky = "sticky left-0 bg-white z-20";
  const headerSticky = "sticky top-0 z-30 bg-amber-50";

  return (
    <div className="border rounded bg-white flex flex-col">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div>
          <div className="text-sm font-semibold">
            {siteTitle} ({siteType})
          </div>
          <div className="text-xs text-slate-500">
            Attendance period: 26/{month === 1 ? 12 : month - 1}/{year} – 25/
            {month}/{year}
          </div>
        </div>
        <LogoutButton />
      </div>

      {/* table area */}
      <div className="overflow-auto max-h-[70vh]">
        <table className="min-w-max text-xs border-collapse">
          <thead>
            <tr className={`${headerSticky} text-center`}>
              <th className={`${leftSticky} border px-2 py-2 w-12`}>Sl</th>
              <th className={`${leftSticky} border px-2 py-2 w-24`}>Emp No</th>
              <th className={`${leftSticky} border px-2 py-2 w-56`}>Name</th>
              <th className="border px-2 py-2 w-32">Designation</th>
              <th className="border px-2 py-2 w-20">Category</th>

              {days.map((d) => {
                const holiday = holidays.has(d.iso);
                return (
                  <th
                    key={d.iso}
                    className={`border px-1 py-1 w-8 text-center ${
                      d.isSunday ? "bg-amber-100" : ""
                    } ${holiday ? "bg-rose-100" : ""}`}
                  >
                    <div className="font-semibold">{d.dayNum}</div>
                    <div className="text-[10px] text-slate-600">{d.dow}</div>
                  </th>
                );
              })}

              {/* simple totals cells placeholder */}
              <th className="border px-2 py-2 w-16">OT</th>
              <th className="border px-2 py-2 w-16">TD</th>
              <th className="border px-2 py-2 w-16">PP</th>
              <th className="border px-2 py-2 w-16">LL</th>
              <th className="border px-2 py-2 w-16">CC</th>
              <th className="border px-2 py-2 w-16">AA</th>
              <th className="border px-2 py-2 w-16">WW</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp, index) => {
              const empFlagSet = flaggedAbsentCells[emp.empNo] || new Set();

              return (
                <React.Fragment key={emp.empNo}>
                  {/* Row 1: attendance codes */}
                  <tr className="border-b text-center">
                    <td className={`${leftSticky} border px-2 py-1 bg-white`}>
                      {index + 1}
                    </td>
                    <td className={`${leftSticky} border px-2 py-1 bg-white`}>
                      {emp.empNo}
                    </td>
                    <td className={`${leftSticky} border px-2 py-1 bg-white`}>
                      {emp.name}
                    </td>
                    <td className="border px-2 py-1">{emp.designation}</td>
                    <td className="border px-2 py-1">{emp.category}</td>

                    {days.map((d) => {
                      const s = getStatus(emp.empNo, d.iso);
                      const editable = canEditStatus(d.iso);
                      const holiday = holidays.has(d.iso);
                      const isAbsent = /^A+$/.test(s);
                      const isFlagged = isAbsent && empFlagSet.has(d.iso);

                      const baseBg = holiday
                        ? "bg-rose-50"
                        : d.isSunday
                        ? "bg-amber-50"
                        : "bg-emerald-50"; // light green for working days

                      const highlightBg = isFlagged
                        ? "bg-rose-300 text-black"
                        : isAbsent
                        ? "bg-rose-200 text-red-900"
                        : "text-slate-800";

                      return (
                        <td
                          key={d.iso}
                          className={`border px-1 py-1 align-middle ${baseBg}`}
                        >
                          {editable ? (
                            <select
                              value={s}
                              onChange={(e) =>
                                setStatus(emp.empNo, d.iso, e.target.value)
                              }
                              className={`text-center text-[11px] border rounded px-1 py-[1px] bg-transparent ${highlightBg}`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.val} value={opt.val}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-1 ${highlightBg}`}
                            >
                              {s}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* simple totals (you can compute properly later) */}
                    <td className="border px-1 py-1 text-center"></td>
                    <td className="border px-1 py-1 text-center">0</td>
                    <td className="border px-1 py-1 text-center">0</td>
                    <td className="border px-1 py-1 text-center">0</td>
                    <td className="border px-1 py-1 text-center">0</td>
                    <td className="border px-1 py-1 text-center">0</td>
                    <td className="border px-1 py-1 text-center">0</td>
                  </tr>

                  {/* Row 2: OT / Holiday work hours */}
                  <tr className="border-b bg-sky-50/40 text-center">
                    <td
                      className={`${leftSticky} border px-2 py-1 bg-sky-50/40`}
                    >
                      <span className="text-[10px] text-slate-500">OT/HW</span>
                    </td>
                    <td
                      className={`${leftSticky} border px-2 py-1 bg-sky-50/40`}
                    />
                    <td
                      className={`${leftSticky} border px-2 py-1 bg-sky-50/40`}
                    />
                    <td
                      className="border px-2 py-1 text-[11px] text-right"
                      colSpan={2}
                    >
                      Hrs:
                    </td>

                    {days.map((d) => {
                      const value = getOT(emp.empNo, d.iso);
                      const editable = canEditOT(d.iso);
                      const holiday = holidays.has(d.iso);
                      const baseBg = holiday
                        ? "bg-rose-50"
                        : d.isSunday
                        ? "bg-amber-50"
                        : "bg-slate-50";

                      return (
                        <td
                          key={d.iso}
                          className={`border px-1 py-1 text-center ${baseBg}`}
                        >
                          {editable ? (
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={value}
                              onChange={(e) =>
                                setOT(emp.empNo, d.iso, e.target.value)
                              }
                              className="ot-hours w-10 mx-auto block text-center text-[11px] border rounded px-1 py-[1px] bg-white"
                            />
                          ) : (
                            <span className="text-[11px]">{value}</span>
                          )}
                        </td>
                      );
                    })}

                    {/* totals placeholder for OT row */}
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
            })}
          </tbody>
        </table>
      </div>

      {/* bottom bar + legend */}
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

      <div className="px-4">
        <Legend />
      </div>
    </div>
  );
}
