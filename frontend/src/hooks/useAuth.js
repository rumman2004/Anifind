import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook to consume AuthContext.
 * Provides: user, login, register, logout, loading
 *
 * Usage:
 *   const { user, login, logout, loading } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
};