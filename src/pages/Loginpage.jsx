import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login/Login";
import { useAuth } from "../context/AuthenticationContext";
import * as notify from "../utils/notify";

export default function Loginpage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { login } = useAuth();

  async function handleLogin(formData) {
    try {
      // call backend + set context
      const loggedInUser = await login(formData); // MUST return user from backend

      if (!loggedInUser) {
        throw new Error("Login failed");
      }

      const dbRole = (loggedInUser.role || "").toUpperCase();
      const dbSite = loggedInUser.site;
      const requestedRole = (formData.role || "").toUpperCase();
      const requestedSite = formData.site;

      // 1) Validate role against DB
      if (dbRole && requestedRole && dbRole !== requestedRole) {
        throw new Error(
          `You are registered as ${dbRole}, not ${requestedRole}.`
        );
      }

      // 2) Decide which site to open
      let targetSite;
      if (dbRole === "SITE_ENGINEER") {
        // site engineer ALWAYS locked to DB site
        targetSite = dbSite;
      } else {
        // admin / viewer – use dropdown site first, then DB, finally fallback
        targetSite = requestedSite || dbSite;
      }

      if (!targetSite) {
        throw new Error("No site assigned to this user.");
      }

      // 3) Navigate
      navigate(`/attendance/${targetSite}`, {
        replace: true,
      });
    } catch (err) {
      const msg = err?.message || "Login failed";
      setError(msg);
      notify.error(msg);
      // let Login component show its own message from props
      throw err;
    }
  }

  return <Login onSubmit={handleLogin} serverError={error} />;
}
