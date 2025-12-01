import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-xl text-center bg-white p-8 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Unauthorized</h2>
        <p className="text-sm text-slate-600 mb-4">
          You do not have permission to access this page. If you believe this is
          an error, contact your administrator.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/" className="px-4 py-2 border rounded">
            Go to Login
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-sky-600 text-white rounded"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
