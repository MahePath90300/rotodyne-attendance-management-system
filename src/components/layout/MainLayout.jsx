import { Outlet } from "react-router-dom";
import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../../context/AuthenticationContext";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const activeTab = useMemo(() => {
    if (location.pathname.includes("attendance")) return "attendance";
    if (location.pathname.includes("employees")) return "employees";
    if (location.pathname.includes("payroll")) return "payroll";
    if (location.pathname.includes("contracts")) return "contracts";
    if (location.pathname.includes("settings")) return "settings";
    return "dashboard";
  }, [location.pathname]);

  const { selectedSite } = useAuth();
  if (!selectedSite) {
    return <div className="p-6">Loading...</div>;
  }

  const handleTabChange = (tab) => {
    switch (tab) {
      case "dashboard":
        navigate(`/dashboard`);
        break;
      case "attendance":
        navigate(`/attendance/${selectedSite}`);
        break;
      case "employees":
        navigate("/employees");
        break;
      case "payroll":
        navigate("/payroll");
        break;
      case "contracts":
        navigate("/contracts");
        break;
      case "settings":
        navigate("/settings");
        break;
      default:
        navigate(`/dashboard/${selectedSite}`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Right Side */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <Header activeTab={activeTab} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
