// File: src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const savedAdmin = authService.getAdmin();
      if (savedAdmin && authService.isAuthenticated()) {
        setAdmin(savedAdmin);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token, adminData) => {
    authService.login(token, adminData);
    setAdmin(adminData);
  };

  const logout = () => {
    authService.logout();
    setAdmin(null);
  };

  const value = {
    admin,
    login,
    logout,
    isAuthenticated: authService.isAuthenticated(),
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
