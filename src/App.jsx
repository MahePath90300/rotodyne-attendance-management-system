import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthenticationContext";

import ProtectedRoute from "./components/ProtectedRoute";

 import AdminDashboard from './pages/AdminDashboard';
 import  Employees from './pages/employee-kyc/EmployeeDirectory';
import Dashboard from "./pages/Dashboard";
import Attendance from './pages/attendance/Attendance';
import Payroll from './pages/payroll/Payroll';
import EmployeeDirectory from './pages/employee-kyc/EmployeeDirectory';
import Loginpage from './pages/Loginpage';
import { useAuth } from "./context/AuthenticationContext";
import Unauthorized from "./pages/Unauthorized";
import MainLayout from "./components/layout/MainLayout";
import ContractManagement from "./pages/Contracts/ContractManagement";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Loginpage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/attendance/:siteId" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeDirectory/>}/>
        <Route path="/payroll" element={<Payroll/>}/>
        <Route path="/contracts" element={<ContractManagement />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
}
