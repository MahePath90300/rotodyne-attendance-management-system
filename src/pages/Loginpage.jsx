import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Login/Login";
import { useAuth } from "../context/AuthenticationContext";

export default function Loginpage() {
  // AuthContext.login should call backend and set user
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { login } = useAuth();
  console.log(login);

  async function handleLogin(formData) {
    console.log(formData);
    // This function will be passed to Login as onSubmit
    try {
      await login(formData); // context login posts to /auth/login and sets global user
      // navigate only after login finishes
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
      // rethrow so Login component catches and shows error
      throw err;
    }
  }

  return (
    <>
      {error && (
        <div className="p-2 bg-red-50 text-red-700 text-sm">{error}</div>
      )}
      <Login onSubmit={handleLogin} />
    </>
  );
}
