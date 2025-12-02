import React, { useMemo, useState } from "react";
import { format, parseISO, addDays } from "date-fns";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthenticationContext.jsx";
import Legend from "./Legend";
import * as notify from "../utils/notify";
import LogoutButton from "./LogoutButton.jsx";


function buildMonthWindow(year, month) {
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const start = new Date(prevYear, prevMonth - 1, 26);
  const end = new Date(year, month - 1, 25);
  const days = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(format(d, "yyyy-MM-dd"));
  return days;
}
function dayNum(iso) { return format(parseISO(iso), "dd"); }
function weekdayShort(iso) { return format(parseISO(iso), "EEE").slice(0,3); }
function isSunday(iso) { return parseISO(iso).getDay() === 0; }

/**
 * Props:
 *  - siteId, siteTitle, siteType
 *  - employees: array of { empNo, name, designation, category (SSW/USW/HW etc), site }
 *  - attendanceMap: { empNo: { '2025-11-26': 'P', ... } }
 *  - holidays: Set(['2025-12-25', ...])
 *  - year, month (month 1..12) to compute 26->25
 *  - onSaved(optional) callback to re-fetch
 *  - allowViewerEdit (boolean) -- if you want viewer editable toggle
 */
export default function AttendanceTable({
  siteId,
  siteTitle,
  siteType,
  employees = [],
  attendanceMap = {},
  holidays = new Set(),
  year,
  month,
  onSaved,
  allowViewerEdit = false
}) {
  const days = useMemo(() => buildMonthWindow(year, month), [year, month]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Local edit buffer: { empNo: { 'yyyy-mm-dd': 'P' } }
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);

  const role = (user?.role || "VIEWER").toUpperCase();

  // split employees into supply and boq sections
  const supplyEmps = employees.filter(e => String(e.category || "").toLowerCase().includes("supply") || String(e.designation || "").toUpperCase().includes("SSW") || String(e.category || "").toUpperCase().includes("SSW"));
  const boqEmps = employees.filter(e => !supplyEmps.includes(e));

  // returns effective status considering local edits
  const getStatus = (empNo, date) => {
    if (edits[empNo] && edits[empNo][date] !== undefined) return edits[empNo][date];
    return (attendanceMap[empNo] && attendanceMap[empNo][date]) || "";
  };

  // role-based editor check
  const editableFor = (date) => {
    if (role === "ADMIN") return true;
    if (role === "SITE_ENGINEER") {
      const today = new Date().toISOString().slice(0,10);
      // site engineer can edit only today's date for their site and only until they submit (server enforces)
      if (String(user.site || "").toUpperCase() !== String(siteId || "").toUpperCase()) return false;
      if (date !== today) return false;
      if (user.lastSubmissionDate === today) return false;
      return true;
    }
    if (role === "VIEWER") return !!allowViewerEdit; // controlled by allowViewerEdit flag
    return false;
  };

  // status options
  const STATUS_OPTIONS = [
    { val: "", label: "" },
    { val: "P", label: "P" },
    { val: "A", label: "A" },
    { val: "PP", label: "PP" },
    { val: "OT", label: "OT" },
    { val: "HW", label: "HW" },
    { val: "LL", label: "LL" },
    { val: "LLL", label: "LLL" }, // if used
    { val: "PP", label: "PP" },
    { val: "WD", label: "WD" }
  ];

  function setEdit(empNo, date, status) {
    setEdits(prev => {
      const copy = { ...prev, [empNo]: { ...(prev[empNo] || {}) } };
      if (status === "" || status == null) {
        delete copy[empNo][date];
        if (Object.keys(copy[empNo]).length === 0) delete copy[empNo];
      } else {
        copy[empNo][date] = status;
      }
      return copy;
    });
  }

  function cycle(empNo, date) {
    if (!editableFor(date)) return;
    const cur = getStatus(empNo, date);
    const idx = STATUS_OPTIONS.findIndex(s => s.val === cur);
    const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length].val;
    setEdit(empNo, date, next);
  }

  // flagged >2 consecutive absences
  const flaggedAbsentees = useMemo(() => {
    const flagged = new Set();
    for (const e of employees) {
      let consec = 0;
      for (const d of days) {
        const s = getStatus(e.empNo, d);
        const absent = (s === "A" || s === "");
        if (absent) {
          consec++;
          if (consec > 2) { flagged.add(e.empNo); break; }
        } else consec = 0;
      }
    }
    return flagged;
  }, [employees, attendanceMap, edits, days]);

  // detect holiday-working (simple heuristic: status 'HW' or 'OT' on holiday)
  const holidayWorker = (empNo) => {
    for (const d of days) {
      const s = getStatus(empNo, d);
      if (holidays.has(d) && (s === "HW" || s === "OT" || s === "P")) return true;
    }
    return false;
  };

  const buildPayload = () => {
    const arr = [];
    for (const empNo of Object.keys(edits)) {
      for (const date of Object.keys(edits[empNo])) {
        arr.push({ empNo, date, status: edits[empNo][date] });
      }
    }
    return arr;
  };

  async function handleSave() {
    const updates = buildPayload();
    if (!updates.length) { notify.info?.("No changes to save"); return; }
    setSaving(true);
    try {
      // call backend (commit 4 will wire endpoint)
      await api.put(`/api/v1/attendance/site/${siteId}/bulk`, { updates });
      notify.success?.("Saved");
      setEdits({});
      onSaved?.();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Save failed";
      notify.error?.(msg);
    } finally {
      setSaving(false);
    }
  }

  // Render helpers for fixed header + left freeze
  const leftColClass = "sticky left-0 z-40 bg-white border-r";
  const leftColWidth = "w-[320px]"; // adjust: left width for name + meta
  const smallCol = "w-14 shrink-0 px-1 py-1 text-center border-r text-xs";

  return (
    <div className="bg-white rounded shadow overflow-auto">
      {/* Top header lines */}
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold">{siteTitle}</div>
            <div className="text-xs text-slate-600 mt-1">ATTENDANCE STATUS for Month of: {format(parseISO(days[Math.floor(days.length/2)]), "MMM, yyyy")} ( as on {format(new Date(), "dd-MM-yyyy")} )</div>
          </div>
          <div className="flex items-center gap-2">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Table header */}
      <div className="sticky top-0 z-30 bg-yellow-50 border-b">
        {/* First two header lines: site title / site type row */}
        <div className="flex items-stretch">
          <div className={`${leftColClass} ${leftColWidth} px-3 py-2`}>
            <div className="text-xs font-semibold">Name</div>
            <div className="text-[11px] text-slate-600 mt-1">Stno</div>
          </div>

          {/* placeholder for the rest header (days) */}
          <div className="flex-1 overflow-hidden">
            <div className="flex">
              {/* First row third header group / columns labels (SlNo, Empno, Name, Designation, Category) */}
              <div className="flex">
                <div className="w-12 shrink-0 px-2 py-2 text-xs font-semibold border-r">Slno</div>
                <div className="w-28 shrink-0 px-2 py-2 text-xs font-semibold border-r">Emp No</div>
                <div className="w-64 shrink-0 px-2 py-2 text-xs font-semibold border-r">Name</div>
                <div className="w-48 shrink-0 px-2 py-2 text-xs font-semibold border-r">Designation</div>
                <div className="w-24 shrink-0 px-2 py-2 text-xs font-semibold border-r">Category</div>
              </div>

              {/* Day columns header */}
              <div className="flex">
                {days.map(d => (
                  <div key={d} className={`${smallCol} ${isSunday(d) ? "bg-orange-100" : ""} ${holidays.has(d) ? "bg-red-100" : ""}`}>
                    <div className="font-medium">{dayNum(d)}</div>
                    <div className="text-[10px] text-slate-600">{weekdayShort(d)}</div>
                  </div>
                ))}

                {/* summary & stat columns after days */}
                {/* OT, bHr, V%, TD, PP, LL, CC, AA, HH, WW, Sitdy, Opay, Ars, Loan, Tds, Adv, othD, Netp */}
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">OT</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">bHr</div>
                <div className="w-10 shrink-0 px-1 py-1 text-xs text-center border-r">V%</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">TD</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">PP</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">LL</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">CC</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">AA</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">HH</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">WW</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">Sitdy</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">Opay</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">Ars</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">Loan</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">Tds</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">Adv</div>
                <div className="w-12 shrink-0 px-1 py-1 text-xs text-center border-r">othD</div>
                <div className="w-16 shrink-0 px-1 py-1 text-xs text-center border-r">Netp</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table body: supply first */}
      <div>
        <div className="text-sm font-semibold px-3 py-2 bg-slate-50 border-b">Supply Manpower</div>
        {supplyEmps.map((emp, idx) => {
          const flagged = flaggedAbsentees.has(emp.empNo);
          const holWork = holidayWorker(emp.empNo);
          return (
            <div key={emp.empNo} className={`flex items-center border-b ${flagged ? "ring-2 ring-yellow-300" : ""} ${holWork ? "ring-2 ring-green-300" : ""}`}>
              <div className={`${leftColClass} ${leftColWidth} px-2 py-2`}>
                <div className="text-sm font-medium">{emp.name}</div>
                <div className="text-xs text-slate-600 mt-1">{emp.stno || ""}</div>
              </div>

              <div className="flex w-full">
                <div className="w-12 shrink-0 px-2 py-2 text-sm border-r">{idx+1}</div>
                <div className="w-28 shrink-0 px-2 py-2 text-sm border-r">{emp.empNo}</div>
                <div className="w-64 shrink-0 px-2 py-2 text-sm border-r">{emp.name}</div>
                <div className="w-48 shrink-0 px-2 py-2 text-sm border-r">{emp.designation}</div>
                <div className="w-24 shrink-0 px-2 py-2 text-sm border-r">{emp.category}</div>

                {days.map(d => {
                  const status = getStatus(emp.empNo, d);
                  const editable = editableFor(d);
                  const cellBg = holidays.has(d) ? "bg-red-50" : isSunday(d) ? "bg-orange-50" : "";
                  return (
                    <div key={d} className={`w-14 shrink-0 px-1 py-2 text-center border-r ${cellBg}`}>
                      {editable ? (
                        <select value={status} onChange={(e)=>setEdit(emp.empNo, d, e.target.value)} className="w-full text-xs">
                          <option value="">--</option>
                          <option value="P">P</option>
                          <option value="A">A</option>
                          <option value="PP">PP</option>
                          <option value="OT">OT</option>
                          <option value="HW">HW</option>
                          <option value="LL">LL</option>
                        </select>
                      ) : (
                        <div className={`text-xs ${status === 'A' ? 'text-red-600' : 'text-slate-700'}`}>{status}</div>
                      )}
                    </div>
                  );
                })}

                {/* stat placeholders */}
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0.0</div>
                <div className="w-10 shrink-0 px-1 py-2 text-xs border-r">0.0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-16 shrink-0 px-1 py-2 text-xs border-r">0.00</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOQ section */}
      <div>
        <div className="text-sm font-semibold px-3 py-2 bg-slate-50 border-b mt-4">BOQ Manpower</div>
        {boqEmps.map((emp, idx) => {
          const flagged = flaggedAbsentees.has(emp.empNo);
          const holWork = holidayWorker(emp.empNo);
          return (
            <div key={emp.empNo} className={`flex items-center border-b ${flagged ? "ring-2 ring-yellow-300" : ""} ${holWork ? "ring-2 ring-green-300" : ""}`}>
              <div className={`${leftColClass} ${leftColWidth} px-2 py-2`}>
                <div className="text-sm font-medium">{emp.name}</div>
                <div className="text-xs text-slate-600 mt-1">{emp.stno || ""}</div>
              </div>

              <div className="flex w-full">
                <div className="w-12 shrink-0 px-2 py-2 text-sm border-r">{idx+1}</div>
                <div className="w-28 shrink-0 px-2 py-2 text-sm border-r">{emp.empNo}</div>
                <div className="w-64 shrink-0 px-2 py-2 text-sm border-r">{emp.name}</div>
                <div className="w-48 shrink-0 px-2 py-2 text-sm border-r">{emp.designation}</div>
                <div className="w-24 shrink-0 px-2 py-2 text-sm border-r">{emp.category}</div>

                {days.map(d => {
                  const status = getStatus(emp.empNo, d);
                  const editable = editableFor(d);
                  const cellBg = holidays.has(d) ? "bg-red-50" : isSunday(d) ? "bg-orange-50" : "";
                  return (
                    <div key={d} className={`w-14 shrink-0 px-1 py-2 text-center border-r ${cellBg}`}>
                      {editable ? (
                        <select value={status} onChange={(e)=>setEdit(emp.empNo, d, e.target.value)} className="w-full text-xs">
                          <option value="">--</option>
                          <option value="P">P</option>
                          <option value="A">A</option>
                          <option value="PP">PP</option>
                          <option value="OT">OT</option>
                          <option value="HW">HW</option>
                          <option value="LL">LL</option>
                        </select>
                      ) : (
                        <div className={`text-xs ${status === 'A' ? 'text-red-600' : 'text-slate-700'}`}>{status}</div>
                      )}
                    </div>
                  );
                })}

                {/* same stat placeholders as supply */}
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0.0</div>
                <div className="w-10 shrink-0 px-1 py-2 text-xs border-r">0.0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-12 shrink-0 px-1 py-2 text-xs border-r">0</div>
                <div className="w-16 shrink-0 px-1 py-2 text-xs border-r">0.00</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action bar */}
      <div className="p-3 bg-white border-t flex items-center justify-between sticky bottom-0">
        <div className="text-sm text-slate-600">Edits: {Object.keys(edits).reduce((c, emp)=>c + Object.keys(edits[emp]).length, 0)}</div>
        <div className="flex gap-2">
          <button onClick={()=>setEdits({})} disabled={saving} className="px-3 py-1 border rounded">Discard</button>
          <button onClick={handleSave} disabled={saving} className="px-3 py-1 bg-sky-600 text-white rounded">{saving ? "Saving..." : "Save changes"}</button>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4">
        <Legend />
      </div>
    </div>
  );
}
