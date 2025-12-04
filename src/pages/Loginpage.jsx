import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login/Login";
import { useAuth } from "../context/AuthenticationContext";
import * as notify from "../utils/notify";

export default function Loginpage() {
  // AuthContext.login should call backend and set user
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { login, user } = useAuth();

  async function handleLogin(formData) {
    // This function will be passed to Login as onSubmit
    try {
      const loggedInUser = await login(formData); // context login posts to /auth/login and sets global user
      const role = (loggedInUser?.role || "").toUpperCase();
      let siteId;
      const siteFromUser = loggedInUser?.site;
      const siteFromForm = formData.site;
      const targetSite = siteFromUser || siteFromForm || "DADRI"; // sensible default
      if (role === "SITE_ENGINEER") {
        // locked to DB site
        siteId = user.site;
      } else {
        // Admin / Viewer – prefer dropdown site, fallback to DB
        siteId = formData.site || user.site || "GARADWARA";
      }

      if (!siteId) throw new Error("No site assigned to this user.");

      navigate(`/dashboard/${targetSite}`, { replace: true });
    } catch (err) {
      const msg = err?.message || "Login failed";
      setError(msg);
      notify.error(msg);
      // rethrow so Login component catches and shows error
    }
  }

  return (
    <>
      <Login onSubmit={handleLogin} />
    </>
  );
}
