import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthenticationContext";
import LogoutButton from "../components/LogoutButton";

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="p-6">Loading...</div>;

  // Example quick role examples
  const isAdmin = user && String(user.role).toUpperCase() === "ADMIN";
  const isSiteEngineer =
    user && String(user.role).toUpperCase() === "SITE_ENGINEER";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
            <p className="text-sm text-slate-500">
              Welcome back, {user?.email}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Role: <strong>{user?.role}</strong> • Site: {user?.site}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </header>

        <main>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white rounded shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Today Summary
              </h3>
              <div className="mt-2 text-2xl font-semibold text-slate-800">
                Present: 45
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Absentees: 3 • OT Hrs: 12
              </div>
            </div>

            <div className="p-4 bg-white rounded shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Quick Actions
              </h3>
              <div className="mt-3 flex flex-col gap-2">
                {isAdmin && (
                  <>
                    <Link to="/employees" className="btn">
                      Manage Employees
                    </Link>
                    <Link to="/holidays" className="btn">
                      Manage Holidays
                    </Link>
                  </>
                )}
                {isSiteEngineer && (
                  <Link to="/attendance" className="btn">
                    Mark Attendance
                  </Link>
                )}
                <Link to="/reports" className="btn">
                  Reports
                </Link>
              </div>
            </div>

            <div className="p-4 bg-white rounded shadow">
              <h3 className="text-sm font-medium text-slate-600">
                Recent Logins
              </h3>
              <ul className="mt-2 text-sm text-slate-700 leading-6">
                <li>admin@rotodyne.com — 2025-11-27 09:01 (You)</li>
                <li>engineer@rotodyne.com — 2025-11-27 08:53</li>
                <li>supervisor@rotodyne.com — 2025-11-26 17:12</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded shadow p-4">
            <h3 className="text-sm font-medium text-slate-600">
              Announcements
            </h3>
            <div className="mt-2 text-sm text-slate-700">
              <p>No announcements for today.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
