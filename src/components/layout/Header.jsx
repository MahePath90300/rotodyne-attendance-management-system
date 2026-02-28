import React from "react";
import { useAuth } from "../../context/AuthenticationContext";
export default function Header({ activeTab }) {
  const { user } = useAuth();
  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-800">
        {activeTab === "dashboard" && "Executive Overview"}
        {activeTab === "employees" && "Employee Directory"}
        {activeTab === "attendance" && "Attendance & Time Tracking"}
        {activeTab === "payroll" && "Wage Sheet Generation"}
        {activeTab === "contracts" && "Contract Management"}
        {activeTab === "settings" && "System Settings"}
      </h1>

      <div className="flex items-center gap-4">
        <div className="bg-slate-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          {user?.role || "Admin"}
        </div>
      </div>
    </header>
  );
}
