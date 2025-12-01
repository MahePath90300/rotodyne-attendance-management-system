import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import api from "../api/axios"; // your axios instance (withCredentials: true)

const AuthContext = createContext(null);

/**
 * AuthProvider - provides user state, login and logout helpers
 *
 * Exports both named and default so imports like:
 *   import { AuthProvider } from './context/AuthContext'
 * or
 *   import AuthProvider from './context/AuthContext'
 * both work.
 */

// login: posts credentials, server sets httpOnly cookie, server returns user payload

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until /me finishes
  
  async function login(credentials) {
    const res = await api.post("/api/v1/auth/login", credentials);
    const loggedUser = res?.data?.user ?? null;
    setUser(loggedUser);
    return loggedUser;
  }

  // logout: call server to clear cookie and clear local state
 async function logout() {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (e) {
      // ignore network errors on logout
    } finally {
      setUser(null);
    }
  }

  // Hydrate on mount: call /api/v1/auth/me
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get("/api/v1/auth/me"); // leading slash is important
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
