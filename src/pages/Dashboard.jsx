import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";

import AttendanceTable from "../components/AttendanceTable";
import { useAuth } from "../context/AuthenticationContext.jsx";
import api from "../api/axios";
import { buildMonthWindow } from "../utils/dates";
import mockData from "../mock/attendance.mock";
import Spinner from "../components/Spinner.jsx";
import { resolveInitialAttendanceMonth } from "../utils/attendanceMonth.js";

function normalizeHolidayISO(dateStr) {
  if (!dateStr) return null;

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // Try to parse dd-MMM-yy (e.g. 25-Dec-25)
  const parsed = Date.parse(dateStr);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }

  return null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { siteId: routeSiteId } = useParams();

  const normalizedSiteId = routeSiteId === "ALL" ? "GARADWARA" : routeSiteId;
  const role = (user?.role || "VIEWER").toUpperCase();
  // Site engineer is locked to their assigned site from DB
  const effectiveSiteId =
    role === "SITE_ENGINEER" ? user.site : normalizedSiteId;

  const { year: initialYear, month: initialMonth } =
    resolveInitialAttendanceMonth(effectiveSiteId);

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const [siteData, setSiteData] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------- paste this inside Dashboard component (e.g. after normalizeHolidayISO) ----------
  async function fetchData(opts = { retries: 2, backoffMs: 500 }) {
    const { retries, backoffMs } = opts;
    setLoading(true);
    setError("");

    // cache-buster param to avoid 304 stale responses after a PUT
    const url = `/api/v1/attendance/site/${encodeURIComponent(effectiveSiteId)}?year=${year}&month=${month}&_ts=${Date.now()}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await api.get(url);
        const body = res.data || {};
        const days = body.days || buildMonthWindow(year, month);

        const holidayIsoList = (body.holidays || [])
          .map(normalizeHolidayISO)
          .filter(Boolean);

        setSiteData({
          siteTitle: body.siteTitle || effectiveSiteId,
          siteType: body.siteType,
          employees: body.employees || [],
          attendanceMap: body.attendanceMap || {},
          otMap: body.otMap || {},
          summaryMap: body.summaryMap || {},
          holidays: new Set(holidayIsoList),
          days,
        });

        setLoading(false);
        return; // success => exit
      } catch (err) {
        const status = err?.response?.status;
        // immediate non-retry errors
        if (status === 401) {
          setError("Unauthorized (401). Please login again.");
          setLoading(false);
          return;
        }
        if (status === 403) {
          setError(
            "Access denied (403). You don't have permission to view this site.",
          );
          setLoading(false);
          return;
        }

        // last attempt - try fallback/mock or show user error
        if (attempt === retries) {
          console.error("fetchData failed:", err);
          // fallback to mock if present
          const mock = mockData[effectiveSiteId];
          if (mock) {
            const days = mock.days || buildMonthWindow(year, month);
            const holidayIsoList = (mock.holidays || [])
              .map(normalizeHolidayISO)
              .filter(Boolean);
            setSiteData({
              siteTitle: mock.siteTitle || effectiveSiteId,
              siteType: mock.siteType,
              employees: mock.employees || [],
              attendanceMap: mock.attendanceMap || {},
              otMap: mock.otMap || {},
              holidays: new Set(holidayIsoList),
              days,
            });
            setLoading(false);
            return;
          } else {
            setError(`Unable to load data for ${effectiveSiteId}.`);
            setSiteData(null);
            setLoading(false);
            return;
          }
        }

        // otherwise retry after backoff
        await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
      }
    }
  }

  // UseEffect: call fetchData initially and on deps change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchData({ retries: 2, backoffMs: 400 });
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveSiteId, year, month, reloadToken]);

  async function handleExport() {
    try {
      const res = await api.get(
        `/api/v1/wage/site/${effectiveSiteId}/export?year=${year}&month=${month}`,
        { responseType: "blob" },
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wage_sheet_${effectiveSiteId}_${year}_${month}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleESIExport() {
    try {
      const res = await api.get(
        `/api/v1/wage/site/${effectiveSiteId}/esi-export?year=${year}&month=${month}`,
        { responseType: "blob" },
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ESI_${effectiveSiteId}_${year}_${month}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("ESI export failed");
    }
  }

  async function handlePFExport() {
    const res = await api.get(
      `/api/v1/wage/site/${effectiveSiteId}/pf-ecr?year=${year}&month=${month}`,
      { responseType: "blob" },
    );

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PF_ECR_${effectiveSiteId}_${year}_${month}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ---------- render ----------

  if (loading) return <Spinner />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!siteData)
    return <div className="p-6">No attendance data for this site.</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Site + period controls (hidden for site engineer) */}
      {role !== "SITE_ENGINEER" && (
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold">
            Site:{" "}
            <span className="font-normal">
              {siteData.siteTitle || effectiveSiteId}
            </span>
          </div>
          <label className="text-sm">Month</label>
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-20 border rounded px-2 py-1 text-sm"
          />
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-24 border rounded px-2 py-1 text-sm"
          />
          {role === "ADMIN" && (
            <button
              onClick={handleExport}
              className="ml-auto px-3 py-1 bg-emerald-600 text-white rounded text-md"
            >
              Export wage sheet (Excel)
            </button>
          )}

          {role === "ADMIN" && (
            <button
              onClick={handleESIExport}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-md"
            >
              Export ESI
            </button>
          )}
          {role === "ADMIN" && (
            <button
              onClick={handlePFExport}
              className="ml-2 px-3 py-1 bg-[#0A639D] text-white rounded text-md"
            >
              Export EPF ECR
            </button>
          )}
        </div>
      )}

      <AttendanceTable
        siteId={effectiveSiteId}
        siteTitle={siteData.siteTitle}
        siteType={siteData.siteType}
        employees={siteData.employees}
        attendanceMap={siteData.attendanceMap}
        summaryMap={siteData.summaryMap}
        otMap={siteData.otMap}
        holidays={siteData.holidays}
        year={year}
        month={month}
        allowViewerEdit={role === "ADMIN"}
        onSaved={() => setReloadToken((t) => t + 1)}
      />
    </div>
  );
}
