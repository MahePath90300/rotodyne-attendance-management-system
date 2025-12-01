import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login/Login";
import { useAuth } from "../context/AuthenticationContext";
import * as notify from "../utils/notify";

export default function Loginpage() {
  // AuthContext.login should call backend and set user
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { login } = useAuth();

  async function handleLogin(formData) {
    // This function will be passed to Login as onSubmit
    try {
      await login(formData); // context login posts to /auth/login and sets global user
      // navigate only after login finishes
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
      notify.error(err?.message);
      // rethrow so Login component catches and shows error
    }
  }

  return (
    <>
      <Login onSubmit={handleLogin} />
    </>
  );
}
