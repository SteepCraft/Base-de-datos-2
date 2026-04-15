import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import api from "../config/api";

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const value = localStorage.getItem("user");
    return value ? JSON.parse(value) : null;
  } catch (_error) {
    localStorage.removeItem("user");
    return null;
  }
};

const isTokenExpired = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded));

    if (!decoded?.exp) return false;
    return decoded.exp * 1000 <= Date.now();
  } catch (_error) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token || isTokenExpired(token)) {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      setLoading(false);
      return { success: false };
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem("access_token", response.data.token);
      }
      return { success: true };
    } catch (_error) {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem("access_token", response.data.token);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error al iniciar sesión",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_error) {
      // ignore logout network errors
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
