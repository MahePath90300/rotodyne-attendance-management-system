import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Download,
  Printer,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calculator,
  IndianRupee,
  Users,
  Calendar,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "..//../context/AuthenticationContext";
import { resolveInitialPayrollMonth } from "../../utils/payroll";
import { buildMonthOptions } from "../../utils/monthOtion";
import { useLocation } from "react-router-dom";
import { Sites } from "../../utils/sites";
import { ComplianceUpdateModal } from "../payroll/ComplianceUpdateModal";

export default function Payroll() {
  const th =
    "px-1 py-[1px] border text-center whitespace-nowrap bg-gray-100 align-middle text-[11px] leading-none";

  const num = "px-4 py-2 border text-right";
  const center = "px-4 py-2 border text-center";
  const stickyBase = "sticky bg-gray-100 z-30 border-r";
  const sticky1 = `${stickyBase} left-0`;
  const sticky2 = `${stickyBase} left-[100px]`;
  const sticky3 = `${stickyBase} left-[340px]`; // 100 + 240
  const sticky4 = `${stickyBase} left-[460px]`; // +120
  const { user, selectedSite } = useAuth();
  const initial = resolveInitialPayrollMonth();
  const [siteId, setSiteId] = useState(selectedSite);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const location = useLocation();
  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeComplianceType, setActiveComplianceType] = useState(null); // 'pf', 'esi', 'bonus'
  const [complianceData, setComplianceData] = useState({
    pf: { status: "Pending", referenceId: "", paymentDate: "" },
    esi: { status: "Pending", referenceId: "", paymentDate: "" },
    bonus: {
      status: "Paid",
      referenceId: "BNS-2025-Q4",
      paymentDate: "2026-01-15",
    },
  });

  const handleUpdateCompliance = (type, data) => {
    setComplianceData((prev) => ({
      ...prev,
      [type]: data,
    }));
  };

  const handleOpenModal = (type) => {
    setActiveComplianceType(type);
    setModalOpen(true);
  };

  const getStatusColor = (status) => {
    return status === "Paid"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const [preview, setPreview] = useState({
    rows: [],
    totals: {},
    summary: {},
    features: {},
  });

  const fetchPreview = async () => {
    try {
      const { data } = await api.get(
        `/api/v1/wage/site/${siteId}/preview?year=${year}&month=${month}`,
      );

      setPreview(data);
    } catch (err) {
      console.error("Preview fetch failed", err);
    }
  };

  useEffect(() => {
    if (selectedSite) {
      setSiteId(selectedSite);
    }
  }, [selectedSite]);

  useEffect(() => {
    if (!siteId) return;
    fetchPreview();
  }, [siteId, year, month]);

  useEffect(() => {
    if (location.state) {
      setSiteId(location.state.siteId);
      setYear(location.state.year);
      setMonth(location.state.month);
    }
  }, []);

  const esiEnabled = preview?.features?.esiEnabled;

  const handleExport = async () => {
    const res = await api.get(
      `/api/v1/wage/site/${siteId}/export?year=${year}&month=${month}`,
      { responseType: "blob" },
    );

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `wage_sheet_${siteId}_${year}_${month}.xlsx`;
    a.click();
  };

  const handleEPFExport = async () => {
    const res = await api.get(
      `/api/v1/wage/site/${siteId}/pf-ecr?year=${year}&month=${month}`,
      { responseType: "blob" },
    );

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PF_ECR_${siteId}_${year}_${month}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleESIExport = async () => {
    const res = await api.get(
      `/api/v1/wage/site/${siteId}/esi-export?year=${year}&month=${month}`,
      { responseType: "blob" },
    );

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ESI_${siteId}_${year}_${month}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totals = useMemo(() => {
    const t = {
      gross: 0,
      salary: 0,
      allowances: 0,
      deductions: 0,
      net: 0,
      fnf: 0,
      employerPF: 0,
      employerESI: 0,
      totalCTC: 0,
      totalOtAmount: 0,
    };

    preview.rows.forEach((r) => {
      t.gross += r.gross || 0;
      t.salary += r.salary || 0;
      t.allowances += r.allowances || 0;
      t.deductions += r.dednTotal || 0;
      t.net += r.netPayable || 0;
      t.fnf += r.totalFnf || 0;
      t.employerPF += r.employerPF || 0;
      t.employerESI += r.employerESI || 0;
      t.totalCTC += r.totalCTC || 0;
      t.totalOtAmount += r.otAmount || 0;
    });

    return t;
  }, [preview.rows]);

  const COL = {
    emp: 100,
    name: 240,
    category: 120,
    gross: 130,
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          {/* <h2 className="text-2xl font-bold text-slate-800">
            Wage Sheet Generation
          </h2> */}
          <h2 className="text-xl font-bold text-slate-800">
            Select period and site to preview / export wage sheet
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            className="h-10 px-4 border rounded-lg bg-white text-sm"
          >
            {user?.role === "ADMIN" ? (
              Sites?.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))
            ) : (
              <option value={user.site}>{user.site}</option>
            )}
          </select>

          <select
            className="h-10 px-4 border rounded-lg bg-white text-sm"
            value={`${year}-${month}`}
            onChange={(e) => {
              const selected = monthOptions.find(
                (m) => m.value === e.target.value,
              );

              setYear(selected.year);
              setMonth(selected.month);
            }}
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* <button className="h-10 px-5 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Calculator size={16} />
            Process Wages
          </button> */}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Payout */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IndianRupee size={60} className="text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            Total Payout (Est.)
          </p>
          <h3 className="text-3xl font-bold mt-2 text-slate-900">
            ₹ {preview?.summary?.totalPayout || 0}
          </h3>

          {/* <div className="mt-4 flex items-center text-green-600 text-sm">
            <CheckCircle size={16} className="mr-1" />
            Includes PF & ESI contributions
          </div> */}
        </div>

        {/* Deductions */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Penalties(if any)</p>
          <h3 className="text-3xl font-bold text-red-600 mt-2">₹ {0}</h3>
        </div>

        {/* Compliance */}
        {/* <div className="bg-white p-6 rounded-xl border shadow-sm">
          <p className="text-sm text-slate-500">Compliance Status</p>

          <div className="flex gap-6 mt-3">
            <Status label="PF Challan" status="Pending" />
            <Status label="ESI Payment" status="Pending" />
            <Status label="Bonus" status="Pending" />
          </div>
        </div> */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-slate-500">
              Compliance Status
            </p>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              Click to Update
            </span>
          </div>
          <div className="flex justify-between space-x-2 mt-4">
            {/* PF Status */}
            <div
              className="text-center cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors flex-1"
              onClick={() => handleOpenModal("pf")}
            >
              <div className="text-xs text-slate-500 mb-1 font-medium">
                PF Challan
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(complianceData.pf.status)}`}
              >
                {complianceData.pf.status}
              </span>
            </div>

            {/* ESI Status */}
            <div
              className="text-center cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors flex-1"
              onClick={() => handleOpenModal("esi")}
            >
              <div className="text-xs text-slate-500 mb-1 font-medium">
                ESI Payment
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(complianceData.esi.status)}`}
              >
                {complianceData.esi.status}
              </span>
            </div>

            {/* Bonus Status */}
            <div
              className="text-center cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors flex-1"
              onClick={() => handleOpenModal("bonus")}
            >
              <div className="text-xs text-slate-500 mb-1 font-medium">
                Bonus
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(complianceData.bonus.status)}`}
              >
                {complianceData.bonus.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Sheet Preview */}
      <div className="bg-white border border-slate-200 rounded-xl flex-1 flex flex-col shadow-sm overflow-hidden min-h-0">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <FileText size={18} className="mr-2 text-slate-500" />
            Wage Sheet Preview
          </h3>
          <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
            <span className="flex items-center text-m text-slate-500">
              <Users size={18} />
              Total Employees: {preview?.rows?.length}
            </span>
          </div>
          <div className="flex gap-2">
            {user?.role === "ADMIN" && (
              <button
                onClick={handleEPFExport}
                className="flex items-center gap-2 px-3 py-1.5 border rounded bg-white text-sm hover:bg-slate-50"
              >
                <Download size={16} />
                Export PF ECR
              </button>
            )}

            {user?.role === "ADMIN" && esiEnabled && (
              <button
                onClick={handleESIExport}
                className="flex items-center gap-2 px-3 py-1.5 border rounded bg-white text-sm hover:bg-slate-50"
              >
                <Download size={16} />
                Export ESI
              </button>
            )}

            {user?.role === "ADMIN" && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 border rounded bg-white text-sm hover:bg-slate-50"
              >
                <Download size={16} />
                Export Wage Sheet
              </button>
            )}
          </div>
        </div>

        <div
          className="overflow-auto flex-1 relative scroll-smooth"
          style={{
            height: "calc(100vh - 340px)",
            minHeight: 400,
          }}
        >
          <table className="min-w-[2200px] w-max text-sm table-fixed relative border-collapse [&_tfoot]:bg-gray-100">
            <thead className="bg-gray-50 border-b-2 border-gray-300 text-gray-700 sticky top-0 z-20 [&_th]:h-8">
              <tr>
                <th
                  rowSpan="2"
                  className={`${th} ${sticky1}`}
                  style={{ width: COL.emp }}
                >
                  Emp No
                </th>
                <th
                  rowSpan="2"
                  className={`${th} ${sticky2}`}
                  style={{ width: COL.name }}
                >
                  Name
                </th>
                <th
                  rowSpan="2"
                  className={`${th} ${sticky3}`}
                  style={{ width: COL.category }}
                >
                  Category
                </th>
                <th
                  rowSpan="2"
                  className={`${th} ${sticky4}`}
                  style={{ width: COL.gross }}
                >
                  Gross
                </th>
                <th rowSpan="2" className={th}>
                  Daily Min Wage
                </th>
                <th rowSpan="2" className={th}>
                  Total Days
                </th>
                <th rowSpan="2" className={th}>
                  Present Days
                </th>
                <th rowSpan="2" className={th}>
                  CL
                </th>
                <th rowSpan="2" className={th}>
                  Holidays
                </th>
                <th rowSpan="2" className={th}>
                  Paid Days
                </th>

                <th colSpan="3" className={th}>
                  Total Earnings
                </th>

                <th rowSpan="2" className={th}>
                  Total Deductions
                </th>

                <th rowSpan="2" className={th}>
                  Net Payable
                </th>
                <th rowSpan="2" className={`${th} text-red-600`}>
                  Penalty
                </th>
                <th rowSpan="2" className={`${th} text-red-600`}>
                  F & F
                </th>
                <th rowSpan="2" className={`${th} text-red-600`}>
                  Employer PF
                </th>
                <th rowSpan="2" className={`${th} text-red-600`}>
                  Employer ESI
                </th>
                <th rowSpan="2" className={`${th} text-red-600`}>
                  Total CTC
                </th>
              </tr>

              <tr>
                <th className={th}>Salary</th>
                <th className={`${th} text-red-600`}>OT Amount</th>
                <th className={th}>Allowances</th>
              </tr>
            </thead>

            <tbody className="[&tr]:h-9">
              {preview.rows?.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className={`${sticky1}`} style={{ width: COL.emp }}>
                    {row.empNo}
                  </td>
                  <td
                    className={`${sticky2} font-medium`}
                    style={{ width: COL.name }}
                  >
                    {row.name}
                  </td>
                  <td className={`${sticky3}`} style={{ width: COL.category }}>
                    {row.category}
                  </td>

                  <td
                    className={`${sticky4} text-right`}
                    style={{ width: COL.gross }}
                  >
                    {row.gross}
                  </td>
                  <td className={num}>{row.dailyWage}</td>

                  <td className={center}>{row.totalDays}</td>
                  <td className={center}>{row.presentDays}</td>
                  <td className={center}>{row.coffDays}</td>
                  <td className={center}>{row.holidays}</td>
                  <td className={center}>{row.paidDays}</td>

                  <td className={num}>{row.salary}</td>
                  <td className={`${num} text-red-600`}>{row.otAmount}</td>
                  <td className={num}>{row.allowances}</td>

                  <td className={num}>{row.dednTotal}</td>

                  <td className={num}>{row.netPayable}</td>
                  <td className={`${num} text-red-600`}>0</td>
                  <td className={`${num} text-red-600`}>{row.totalFnf}</td>
                  <td className={`${num} text-red-600`}>{row.employerPF}</td>
                  <td className={`${num} text-red-600`}>{row.employerESI}</td>

                  <td className={`${num} text-red-600`}>{row.totalCTC}</td>
                </tr>
              ))}
              {/* ✅ STICKY TOTAL ROW */}
              {/* <tr className="font-bold">
  <td className={`${sticky1} sticky bottom-0 bg-gray-100 z-[60]`}>
    TOTAL
  </td>

  <td className={`${sticky2} sticky bottom-0 bg-gray-100 z-[60]`} />
  <td className={`${sticky3} sticky bottom-0 bg-gray-100 z-[60]`} />

  <td className={`${sticky4} sticky bottom-0 bg-gray-100 z-[60] text-right`}>
    {totals.gross}
  </td>

  {Array.from({ length: 6 }).map((_, i) => (
    <td key={i} className="sticky bottom-0 bg-gray-100 z-50"></td>
  ))}

  <td className={`${num} sticky bottom-0 bg-gray-100 z-50`}>
    {totals.salary}
  </td>

  <td className={`${num} text-red-600 sticky bottom-0 bg-gray-100 z-50`}>
    {totals.totalOtAmount}
  </td>

  <td className={`${num} sticky bottom-0 bg-gray-100 z-50`}>
    {totals.allowances}
  </td>

  <td className={`${num} sticky bottom-0 bg-gray-100 z-50`}>
    {totals.deductions}
  </td>

  <td className={`${num} sticky bottom-0 bg-gray-100 z-50`}>
    {totals.net}
  </td>

  <td className={`${num} text-red-600 sticky bottom-0 bg-gray-100 z-50`}>
    0
  </td>

  <td className={`${num} text-red-600 sticky bottom-0 bg-gray-100 z-50`}>
    {totals.fnf}
  </td>

  <td className={`${num} text-red-600 sticky bottom-0 bg-gray-100 z-50`}>
    {totals.employerPF}
  </td>

  <td className={`${num} text-red-600 sticky bottom-0 bg-gray-100 z-50`}>
    {totals.employerESI}
  </td>

  <td className={`${num} text-red-600 font-extrabold sticky bottom-0 bg-gray-100 z-50`}>
    {totals.totalCTC}
  </td>
</tr> */}
            </tbody>

            {/* <tfoot className="bg-gray-100 font-bold sticky bottom-0 z-40">
              <tr>
                <td className={sticky1} style={{ width: COL.emp }}>
                  TOTAL
                </td>
                <td className={sticky2} style={{ width: COL.name }} />
                <td className={sticky3} style={{ width: COL.category }} />
                <td
                  className={`${sticky4} text-right`}
                  style={{ width: COL.gross }}
                >
                  {totals.gross}
                </td>

                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>

                <td className={num}>{totals.salary}</td>
                <td className={`${num} text-red-600`}>
                  {totals.totalOtAmount}
                </td>
                <td className={num}>{totals.allowances}</td>

                <td className={num}>{totals.deductions}</td>
                <td className={num}>{totals.net}</td>

                <td className={`${num} text-red-600`}>0</td>
                <td className={`${num} text-red-600`}>{totals.fnf}</td>
                <td className={`${num} text-red-600`}>{totals.employerPF}</td>
                <td className={`${num} text-red-600`}>{totals.employerESI}</td>

                <td className={`${num} text-red-600 font-extrabold`}>
                  {totals.totalCTC}
                </td>
              </tr>
            </tfoot> */}

            {/* <tfoot className="sticky bottom-0 z-[100]">
  <tr className="bg-gray-100 font-bold">

    <td className={`${sticky1}`}>TOTAL</td>
    <td className={sticky2}></td>
    <td className={sticky3}></td>

    <td className={`${sticky4} text-right`}>
      {totals.gross}
    </td>

    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>

    <td className={num}>{totals.salary}</td>
    <td className={`${num} text-red-600`}>
      {totals.totalOtAmount}
    </td>
    <td className={num}>{totals.allowances}</td>

    <td className={num}>{totals.deductions}</td>
    <td className={num}>{totals.net}</td>

    <td className={`${num} text-red-600`}>0</td>
    <td className={`${num} text-red-600`}>{totals.fnf}</td>
    <td className={`${num} text-red-600`}>{totals.employerPF}</td>
    <td className={`${num} text-red-600`}>{totals.employerESI}</td>

    <td className={`${num} text-red-600 font-extrabold`}>
      {totals.totalCTC}
    </td>

  </tr>
</tfoot> */}
            <tfoot className="bg-gray-100 font-bold sticky bottom-0 z-30">
              <tr>
                {/* 1 */}
                <td className={sticky1}>TOTAL</td>

                {/* 2 */}
                <td className={sticky2}></td>

                {/* 3 */}
                <td className={sticky3}></td>

                {/* 4 */}
                <td className={`${sticky4} text-right`}>{totals.gross}</td>

                {/* ----- MATCH BODY EXACTLY ----- */}

                {/* 5 Daily Wage */}
                <td className={num}></td>

                {/* 6 Total Days */}
                <td className={center}></td>

                {/* 7 Present */}
                <td className={center}></td>

                {/* 8 CL */}
                <td className={center}></td>

                {/* 9 Holidays */}
                <td className={center}></td>

                {/* 10 Paid Days */}
                <td className={center}></td>

                {/* 11 Salary */}
                <td className={num}>{totals.salary}</td>

                {/* 12 OT */}
                <td className={`${num} text-red-600`}>
                  {totals.totalOtAmount}
                </td>

                {/* 13 Allowances */}
                <td className={num}>{totals.allowances}</td>

                {/* 14 Deductions */}
                <td className={num}>{totals.deductions}</td>

                {/* 15 Net */}
                <td className={num}>{totals.net}</td>

                {/* 16 Penalty */}
                <td className={`${num} text-red-600`}>0</td>

                {/* 17 FNF */}
                <td className={`${num} text-red-600`}>{totals.fnf}</td>

                {/* 18 Employer PF */}
                <td className={`${num} text-red-600`}>{totals.employerPF}</td>

                {/* 19 Employer ESI */}
                <td className={`${num} text-red-600`}>{totals.employerESI}</td>

                {/* 20 Total CTC */}
                <td className={`${num} text-red-600 font-extrabold`}>
                  {totals.totalCTC}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* ✅ STICKY TOTAL BAR (OUTSIDE TABLE) */}
        {/* <div className="sticky bottom-0 z-40 bg-gray-100 border-t shadow-md">
  <div className="min-w-[2200px] w-max flex text-sm font-bold">

    <div style={{ width: COL.emp }} className="px-2 py-2 border-r">
      TOTAL
    </div>

    <div style={{ width: COL.name }} />
    <div style={{ width: COL.category }} />

    <div
      style={{ width: COL.gross }}
      className="px-2 py-2 border-r text-right"
    >
      {totals.gross}
    </div>

    <div className="flex-1 grid grid-cols-[repeat(16,minmax(120px,1fr))]">

      <div />
      <div />
      <div />
      <div />
      <div />
      <div />

      <div className="text-right px-2">{totals.salary}</div>
      <div className="text-right text-red-600 px-2">
        {totals.totalOtAmount}
      </div>
      <div className="text-right px-2">{totals.allowances}</div>

      <div className="text-right px-2">{totals.deductions}</div>
      <div className="text-right px-2">{totals.net}</div>

      <div className="text-right text-red-600 px-2">0</div>
      <div className="text-right text-red-600 px-2">{totals.fnf}</div>
      <div className="text-right text-red-600 px-2">{totals.employerPF}</div>
      <div className="text-right text-red-600 px-2">{totals.employerESI}</div>

      <div className="text-right text-red-600 font-extrabold px-2">
        {totals.totalCTC}
      </div>
    </div>

  </div>
</div> */}
      </div>
      <ComplianceUpdateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={activeComplianceType}
        currentStatus={
          activeComplianceType ? complianceData[activeComplianceType] : null
        }
        onUpdate={handleUpdateCompliance}
      />
    </div>
  );
}
