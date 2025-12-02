import React, { useEffect, useState } from "react";
import SiteSelector from "../components/SiteSelector";
import AttendanceTable from "../components/AttendanceTable";
import { buildMonthWindow } from "../utils/dates";
import { useAuth } from "../context/AuthenticationContext.jsx";
import api from "../api/axios";

import mockData from "../mock/attendance.mock";

export default function Dashboard() {
  const [company, setCompany] = useState("RES");
  const [sites, setSites] = useState({
    list: [
      { id: "ALL", name: "All Sites" },
      { id: "GARADWARA", name: "Garadwara" },
      { id: "DADRI", name: "Dadri" },
    ],
    selected: "ALL",
  });
  const [selectedSite, setSelectedSite] = useState("ALL");
  const [siteData, setSiteData] = useState(null);
  const { user } = useAuth();

  // month window: choose month/year (defaults to current month)
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1; // 1..12
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);

  useEffect(() => {
    let mounted = true;

    async function loadFromApi(siteId) {
      try {
        // If user selected "ALL", we don't call the single-site API — show instruction.
        if (siteId === "ALL") {
          if (!mounted) return;
          setSiteData(null); // UI will show "select a site..."
          return;
        }

        // call your backend endpoint
        const res = await api.get(`/api/v1/attendance/site/${encodeURIComponent(siteId)}?year=${year}&month=${month}`);
        if (!mounted) return;
        // expect server to return the same shape as mock:
        // { siteTitle, siteType, employees, attendanceMap, holidays }
        setSiteData(res.data);
      } catch (err) {
        // API failed (404 or network). Log and fallback to mock if available.
        console.error("Attendance API failed:", err?.response?.status, err?.response?.data || err.message);

        // fallback behavior: if mockData has the site, use that
        const mock = mockData[siteId];
        if (mock) {
          console.warn("Using mockData fallback for site:", siteId);
          if (mounted) {
            setSiteData({
              siteTitle: mock.siteTitle,
              siteType: mock.siteType,
              employees: mock.employees,
              attendanceMap: mock.attendanceMap,
              holidays: mock.holidays,
            });
          }
          return;
        }

        // if no mock available, show a friendly error state
        if (mounted) {
          setSiteData({ error: true, message: `Unable to load data for ${siteId}.` });
        }
      }
    }

    loadFromApi(selectedSite);

    return () => {
      mounted = false;
    };
  }, [selectedSite, year, month]);

  function onOpenSite(siteId) {
    setSelectedSite(siteId);
  }

  // UI decision logic
  if (selectedSite === "ALL") {
    return (
      <div className="p-6">
        <SiteSelector
          company={company}
          setCompany={setCompany}
          sites={sites}
          setSite={(val) => setSites({ ...sites, selected: val })}
          onOpenSite={onOpenSite}
        />

        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm">Month</label>
          <input
            type="number"
            value={month}
            min={1}
            max={12}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-20 border rounded px-2 py-1"
          />
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-28 border rounded px-2 py-1"
          />
        </div>

        <div className="bg-white rounded shadow p-4">Select a site (Garadwara or Dadri) to view attendance.</div>
      </div>
    );
  }

  // selectedSite != 'ALL'
  if (!siteData) {
    // loading state (either waiting for API or fallback)
    return (
      <div className="p-6">
        <SiteSelector
          company={company}
          setCompany={setCompany}
          sites={sites}
          setSite={(val) => setSites({ ...sites, selected: val })}
          onOpenSite={onOpenSite}
        />
        <div className="mt-6">Loading attendance for <b>{selectedSite}</b> ...</div>
      </div>
    );
  }

  if (siteData.error) {
    return (
      <div className="p-6">
        <SiteSelector
          company={company}
          setCompany={setCompany}
          sites={sites}
          setSite={(val) => setSites({ ...sites, selected: val })}
          onOpenSite={onOpenSite}
        />
        <div className="mt-6 text-red-600">Error: {siteData.message}</div>
      </div>
    );
  }

  // Render table
  return (
    <div className="p-6">
      <SiteSelector
        company={company}
        setCompany={setCompany}
        sites={sites}
        setSite={(val) => setSites({ ...sites, selected: val })}
        onOpenSite={onOpenSite}
      />
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm">Month</label>
        <input
          type="number"
          value={month}
          min={1}
          max={12}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="w-20 border rounded px-2 py-1"
        />
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-28 border rounded px-2 py-1"
        />
      </div>

      <h2 className="text-lg font-semibold mb-2">
        {siteData.siteTitle || selectedSite} — {month}/{year}
      </h2>

      <AttendanceTable
        siteId={selectedSite}
        siteTitle={siteData.siteTitle || selectedSite}
        siteType={siteData.siteType || "Supply"}
        employees={siteData.employees || []}
        attendanceMap={siteData.attendanceMap || {}}
        holidays={new Set(siteData.holidays || [])}
        year={year}
        month={month}
        onSaved={() => {
          
          setSiteData(null);
        }}
        allowViewerEdit={false}
      />
    </div>
  );
}
