// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import AttendanceTable from "../components/AttendanceTable";
import { useAuth } from "../context/AuthenticationContext.jsx";
import api from "../api/axios";
import { buildMonthWindow } from "../utils/dates";
import mockData from "../mock/attendance.mock";

export default function Dashboard() {
  const { user } = useAuth();
  const { siteId: routeSiteId } = useParams();

  const normalizedSiteId = routeSiteId === "ALL" ? "GARADWARA" : routeSiteId;
  const role = (user?.role || "VIEWER").toUpperCase();
  // Site engineer is locked to their assigned site from DB
  const effectiveSiteId =
    role === "SITE_ENGINEER" ? user.site : normalizedSiteId;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [siteData, setSiteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        // --- API call ---
        const res = await api.get(
          `/api/v1/attendance/site/${encodeURIComponent(
            effectiveSiteId
          )}?year=${year}&month=${month}`
        );

        if (cancelled) return;

        const body = res.data || {};
        const days = body.days || buildMonthWindow(year, month); // if buildMonthWindow returns array
        setSiteData({
          siteTitle: body.siteTitle || effectiveSiteId,
          siteType: body.siteType || "Supply",
          employees: body.employees || [],
          attendanceMap: body.attendanceMap || {},
          otMap: body.otMap || {},
          holidays: new Set(body.holidays || []),
          days,
        });
      } catch (err) {
        console.error("Attendance API failed:", err?.message || err);
        if (cancelled) return;

        // --- fallback to mock ---
        const mock = mockData[effectiveSiteId];
        if (mock) {
          const days = mock.days || buildMonthWindow(year, month);
          setSiteData({
            siteTitle: mock.siteTitle || effectiveSiteId,
            siteType: mock.siteType || "Supply",
            employees: mock.employees || [],
            attendanceMap: mock.attendanceMap || {},
            otMap: mock.otMap || {},
            holidays: new Set(mock.holidays || []),
            days,
          });
        } else {
          setError(`Unable to load data for ${effectiveSiteId}.`);
          setSiteData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [effectiveSiteId, year, month]);

  // ---------- render ----------

  if (loading) return <div className="p-6">Loading...</div>;
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
        </div>
      )}

      <AttendanceTable
        siteId={effectiveSiteId}
        siteTitle={siteData.siteTitle}
        siteType={siteData.siteType}
        employees={siteData.employees}
        attendanceMap={siteData.attendanceMap}
        otMap={siteData.otMap}
        holidays={siteData.holidays}
        year={year}
        month={month}
        allowViewerEdit={role === "ADMIN"}
      />
    </div>
  );
}
