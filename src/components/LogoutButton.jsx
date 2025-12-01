import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthenticationContext";

export default function LogoutButton({ className }) {
  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setBusy(true);
    try {
      await logout(); // AuthContext.logout calls backend /logout and clears state
      navigate("/", { replace: true }); // go to login
    } catch (err) {
      console.error("Logout failed", err);
      navigate("/", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={busy}
      className={`${className || "px-3 py-1 rounded border text-sm"}`}
    >
      {busy ? "Signing out..." : "Logout"}
    </button>
  );
}
