// src/components/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({
  onSubmit, // required: async function(formData) -> login logic done by parent
  companies = [
    { id: "RES", name: "RES" },
    { id: "REF", name: "REF" },
  ],
  sitesByCompany = {
    RES: [
      { id: "RES-01", name: "RES - Site 01" },
      { id: "RES-02", name: "RES - Site 02" },
    ],
    REF: [
      { id: "REF-101", name: "REF - Site 101" },
      { id: "REF-102", name: "REF - Site 102" },
    ],
  },
  defaultCompany = "RES",
  defaultRole = "SITE ENGINEER",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [company, setCompany] = useState(defaultCompany);
  const [site, setSite] = useState("ALL");
  const [role, setRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const navigate = useNavigate();

  const currentSites = useMemo(
    () => sitesByCompany?.[company] ?? [],
    [company, sitesByCompany]
  );

  useEffect(() => setSite("ALL"), [company]);

  function validate() {
    const err = {};
    if (!email.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) err.email = "Enter a valid email.";
    if (!password.trim()) err.password = "Password is required";
    if (!employeeId.trim()) err.employeeId = "Employee ID is required";
    if (!role.trim()) err.role = "Role is Required";
    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    if (!onSubmit || typeof onSubmit !== "function") {
      setFormError("Login handler not wired. Please contact developer.");
      return;
    }

    setBusy(true);
    try {
      const data = { email, password, employeeId, company, site, role };
      // IMPORTANT: delegate login to parent (which should call AuthContext.login)
      await onSubmit(data);

      // At this point the parent should have set the global user
      // navigate to dashboard
      navigate("/dashboard");
    } catch (loginError) {
      // show message from parent
      setFormError(loginError?.message || "Login failed");
      throw loginError; // rethrow if parent needs to catch
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Panel */}
        <aside className="bg-gradient-to-br from-[#1e5bb8] via-[#164a94] to-[#183f73] p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
          <img
            src="src/assets/logo-rotodyne.png"
            alt="Logo"
            className="w-24 h-24 mb-4"
          />
          <h2 className="text-3xl text-white font-semibold text-sky-800">
            Rotodyne Industries
          </h2>
          <p className="mt-4 font-medium text-white text-slate-500 text-center">
            Attendance Management System
          </p>
          <p className="mt-2 text-sm text-white text-slate-600">
            (For Internal Use Only)
          </p>
        </aside>

        {/* Right Panel */}
        <main className="p-6 md:p-10">
          <h3 className="text-xl font-medium text-slate-800 mb-4">
            Login to continue
          </h3>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm text-slate-700">Email</label>
              <input
                type="text"
                placeholder="Enter your email"
                className={`mt-1 block w-full rounded-md border px-3 py-2
                  ${errors.email ? "border-red-500" : "border-slate-300"}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`block w-full rounded-md border px-3 py-2 pr-14 ${errors.password ? "border-red-500" : "border-slate-300"}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2 text-sm text-slate-600"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/*Employee ID */}
            <div>
              <label className="block text-sm text-slate-700">
                Employee ID
              </label>
              <input
                type="text"
                placeholder="Enter your employee id"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.employeeId ? "border-red-500" : "border-slate-300"}`}
              />
              {errors.employeeId && (
                <p className="text-xs text-red-600 mt-1">{errors.employeeId}</p>
              )}
            </div>

            {/* Company Dropdown + Site */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700">Company</label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-700">Site</label>
                <select
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
                >
                  <option value="ALL">All Sites</option>
                  {currentSites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm text-slate-700">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 ${errors.role ? "border-red-500" : "border-slate-300"}`}
              >
                <option value="RES">SITE ENGINEER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="VIEWER">VIEWER</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-600 mt-1">{errors.role}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className={`w-full rounded-md px-4 py-2 text-white font-medium ${
                busy ? "bg-sky-300" : "bg-sky-700 hover:bg-sky-600"
              }`}
            >
              {busy ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-xs text-slate-400">
            <div>© Rotodyne Industries</div>
            <div>Attendance Management System — v1.0</div>
          </div>
        </main>
      </div>
    </div>
  );
}
export default Login;
