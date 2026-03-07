// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // initial state from localStorage (includes avatar if previously saved)
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const verifyRan = useRef(false);

  useEffect(() => {
    if (verifyRan.current) return;
    verifyRan.current = true;

    const verify = async () => {
      const stored = authService.getCurrentUser();
      if (!stored?.token) {
        setLoading(false);
        return;
      }

      // optimistically show stored user (avatar included)
      setUser(stored);

      try {
        const fresh = await authService.getMe();
        setUser(fresh);
      } catch (err) {
        if (err?.response?.status === 401) {
          authService.logout();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // 👇 used by Profile page when updating avatar/username/bio
  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("anifind_user", JSON.stringify(next));
      return next;
    });
  };

  // keep localStorage in sync if user changes via other flows
  useEffect(() => {
    if (user) {
      localStorage.setItem("anifind_user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};