import { Routes, Route, Navigate} from "react-router-dom";
import Loginpage from './pages/Loginpage';
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (

      <Routes>
        <Route path="/" element={<Loginpage />} />
        {/* site-specific dashboard */}
        <Route path="/dashboard"
        element={<Navigate to="/dashboard/DADRI" replace />}
        />
        <Route
          path="/dashboard/:siteId"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
  );
}

export default App;
