import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import api from "../api/axios";
import * as notify from "../utils/notify";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until /me finishes
  
  async function login(credentials) {
    try{
    const res = await api.post("/api/v1/auth/login", credentials);
    const loggedUser = res?.data?.user ?? null;
    setUser(loggedUser);
    notify.success("Successfully Logged in");
    return loggedUser;
    }catch(err){
      const message = err?.response?.data?.message || err?.message || "Login failed";
       notify.error(message);
       throw err;
    }
  }

  // logout: call server to clear cookie and clear local state
 async function logout() {
    try {
      await api.post("/api/v1/auth/logout");
      notify.success("Logged out successfuly")
    } catch (e) {
      // ignore network errors on logout
      notify.warn("Unable to contact server; local session cleared");
    } finally {
      setUser(null);
    }
  }

  // Hydrate on mount: call /api/v1/auth/me
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get("/api/v1/auth/me"); 
        if (mounted && res?.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        // Not authenticated or network error — ignore here
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = { user, setUser, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;


AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
