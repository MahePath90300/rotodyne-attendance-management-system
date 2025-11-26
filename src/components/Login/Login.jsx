import React, { useEffect, useMemo, useState } from "react";

function Login({
  onSubmit,
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
  defaultRole = "RES",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stno, setStno] = useState("");

  const [company, setCompany] = useState(defaultCompany);
  const [site, setSite] = useState("ALL");
  const [role, setRole] = useState(defaultRole);

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const currentSites = useMemo(() => {
    return sitesByCompany?.[company] ?? [];
  }, [company, sitesByCompany]);

  // Reset site when company changes
  useEffect(() => {
    setSite("ALL");
  }, [company]);

  async function handleSubmit(e) {
    e.preventDefault();

    setBusy(true);

    const data = {
      email,
      password,
      stno,
      company,
      site,
      role,
    };

    if (onSubmit) {
      await onSubmit(data);
    }

    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Panel */}
        <aside className="hidden md:flex flex-col items-center justify-center p-8 bg-gradient-to-b from-sky-50 to-white">
          <img
            src="src/assets/logo-rotodyne.png"
            alt="Logo"
            className="w-24 h-24 mb-4"
          />
          <h2 className="text-2xl font-semibold text-sky-800">
            Rotodyne Industries
          </h2>
          <p className="mt-2 text-sm text-slate-600">For Internal Use</p>
          <p className="mt-6 text-xs text-slate-500 text-center">
            Attendance Management System
          </p>
        </aside>

        {/* Right Panel */}
        <main className="p-6 md:p-10">
          <h3 className="text-xl font-medium text-slate-800 mb-4">
            Sign in to continue
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-slate-700">Email</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 pr-14"
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
            </div>

            {/* Company Dropdown */}
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

            {/* STNO + Site */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700">STNO</label>
                <input
                  type="text"
                  value={stno}
                  onChange={(e) => setStno(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
                />
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
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="RES">RES</option>
                <option value="ADMIN">ADMIN</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className={`w-full rounded-md px-4 py-2 text-white font-medium ${
                busy ? "bg-sky-300" : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              {busy ? "Signing in..." : "Login"}
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
