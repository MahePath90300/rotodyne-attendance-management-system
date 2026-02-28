import React, { useState } from "react";
import { MapPin, Save, ChevronLeft, ChevronRight } from "lucide-react";

export default function Attendance() {
  const [view, setView] = (useState < "daily") | ("monthly" > "daily");
  const [selectedSite, setSelectedSite] = useState("All Sites");

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-colors cursor-pointer"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
            >
              <option>All Sites</option>
              <option>HO Hyderabad</option>
              <option>Factory Unit 1</option>
              <option>NTPC Dadri (AMC)</option>
              <option>IOCL Panipat (AMC)</option>
              <option>Reliance Jamnagar (Project)</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setView("daily")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === "daily" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              Daily
            </button>
            <button
              onClick={() => setView("monthly")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === "monthly" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
            >
              Monthly Sheet
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <button className="p-1 hover:bg-slate-200 rounded">
              <ChevronLeft size={16} />
            </button>
            <span className="font-medium">February 2026</span>
            <button className="p-1 hover:bg-slate-200 rounded">
              <ChevronRight size={16} />
            </button>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm">
            <Save size={18} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Total Man Days</div>
          <div className="text-2xl font-bold text-slate-900">1,240</div>
          <div className="text-xs text-green-600 mt-1">
            On track with contract
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Shortage / Absent</div>
          <div className="text-2xl font-bold text-red-600">12</div>
          <div className="text-xs text-red-500 mt-1">
            Potential Penalty: ₹24k
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Overtime Hours</div>
          <div className="text-2xl font-bold text-orange-600">450 hrs</div>
          <div className="text-xs text-slate-500 mt-1">across 3 sites</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500 mb-1">Travel Time Claims</div>
          <div className="text-2xl font-bold text-blue-600">28</div>
          <div className="text-xs text-slate-500 mt-1">Pending Approval</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="bg-white border border-slate-200 rounded-xl flex-1 overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-20">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-r border-slate-200 min-w-[200px] left-0 sticky bg-slate-50 z-30 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                  Employee
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16">
                  01
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16">
                  02
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16 bg-red-50 text-red-600">
                  03 Su
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16">
                  04
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16">
                  05
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16">
                  06
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16">
                  07
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16">
                  08
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16">
                  09
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-16 bg-red-50 text-red-600">
                  10 Su
                </th>
                <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-24">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 border-r border-slate-200 left-0 sticky bg-white z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                    <div className="font-medium text-slate-900 text-sm">
                      Ravi Sharma
                    </div>
                    <div className="text-xs text-slate-500">
                      Tech • NTPC Dadri
                    </div>
                  </td>
                  <AttendanceCell status="P" />
                  <AttendanceCell status="P" />
                  <AttendanceCell status="WO" />
                  <AttendanceCell status="P" />
                  <AttendanceCell status="L" />
                  <AttendanceCell status="P" />
                  <AttendanceCell status="P" />
                  <AttendanceCell status="P" />
                  <AttendanceCell status="HD" />
                  <AttendanceCell status="WO" />
                  <td className="px-2 py-3 text-center text-sm font-bold text-slate-900">
                    8.5
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> P -
            Present
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> A -
            Absent
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span> L
            - Leave
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> WO -
            Weekly Off
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span> HD
            - Half Day
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span> T
            - Travel
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceCell({ status }) {
  let bgColor = "bg-white";
  let textColor = "text-slate-700";

  switch (status) {
    case "P":
      bgColor = "bg-green-50";
      textColor = "text-green-700";
      break;
    case "A":
      bgColor = "bg-red-50";
      textColor = "text-red-700";
      break;
    case "WO":
      bgColor = "bg-slate-100";
      textColor = "text-slate-500";
      break;
    case "L":
      bgColor = "bg-yellow-50";
      textColor = "text-yellow-700";
      break;
    case "HD":
      bgColor = "bg-orange-50";
      textColor = "text-orange-700";
      break;
  }

  return (
    <td
      className={`px-1 py-1 border-r border-slate-100 ${status === "WO" ? "bg-slate-50" : ""}`}
    >
      <div
        className={`w-8 h-8 mx-auto rounded flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 ring-blue-400 ${bgColor} ${textColor}`}
      >
        {status}
      </div>
    </td>
  );
}
