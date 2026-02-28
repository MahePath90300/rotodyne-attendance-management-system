import React, { useState } from "react";
import {
  Menu,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthenticationContext";

export default function Sidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  const { siteId } = useParams();

  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    if (busy) return;

    setBusy(true);

    try {
      await logout(); // clears auth + backend logout
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setBusy(false);
      navigate("/", { replace: true });
    }
  }
  return (
    <aside
      className={`bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {isSidebarOpen ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
              R
            </div>
            <span className="font-bold text-lg tracking-tight">ROTODYNE</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl mx-auto">
            R
          </div>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 hover:bg-slate-800 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-2">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem
            icon={<Users size={20} />}
            label="HR & Employees"
            active={activeTab === "employees"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("employees")}
          />
          <NavItem
            icon={<Calendar size={20} />}
            label="Attendance"
            active={activeTab === "attendance"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("attendance")}
          />
          <NavItem
            icon={<FileText size={20} />}
            label="Payroll & Wages"
            active={activeTab === "payroll"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("payroll")}
          />
          <NavItem
            icon={<Briefcase size={20} />}
            label="Contract Mgmt"
            active={activeTab === "contracts"}
            isOpen={isSidebarOpen}
            onClick={() => setActiveTab("contracts")}
          />
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-800">
        {/* <NavItem 
          icon={<Settings size={20} />} 
          label="Settings" 
          active={activeTab === 'settings'} 
          isOpen={isSidebarOpen}
          onClick={() => setActiveTab('settings')}
        /> */}
        <NavItem
          icon={<LogOut size={20} />}
          label={busy ? "Logging out..." : "Logout"}
          active={false}
          isOpen={isSidebarOpen}
          onClick={handleLogout}
          disabled={busy}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-2"
        />
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  isOpen,
  onClick,
  className = "",
  disabled,
}) {
  return (
    <li>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group relative
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${
          active
            ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        } ${className}`}
      >
        <span>{icon}</span>
        {isOpen && <span className="ml-3 font-medium">{label}</span>}
      </button>
    </li>
  );
}
