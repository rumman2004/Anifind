// src/services/authService.js
import { backendAPI } from "./api.js";

const USER_KEY = "anifind_user";

export const authService = {
  register: async (userData) => {
    const res = await backendAPI.post("/auth/register", userData);
    // 👇 response should include token + avatar (default "")
    localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    return res.data;
  },

  login: async (credentials) => {
    const res = await backendAPI.post("/auth/login", credentials);
    // 👇 same here
    localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    return res.data;
  },

  // verify token is still valid — called once on app load
  getMe: async () => {
    const res = await backendAPI.get("/auth/me"); // returns _id, username, email, avatar
    const current = authService.getCurrentUser();
    const updated = { ...current, ...res.data };   // keep token, merge avatar updates if any
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  logout: () => localStorage.removeItem(USER_KEY),

  getCurrentUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
};