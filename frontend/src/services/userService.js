// src/services/userService.js
import { backendAPI } from "./api.js";

const USER_KEY = "anifind_user";

const syncStorage = (fresh) => {
  const stored = JSON.parse(localStorage.getItem(USER_KEY) || "null");
  // 👇 merge new profile (including avatar) with existing (including token)
  const updated = { ...stored, ...fresh };
  localStorage.setItem(USER_KEY, JSON.stringify(updated));
  return updated;
};

export const userService = {
  // GET /api/users/profile
  getProfile: async () => {
    const res = await backendAPI.get("/users/profile");
    return syncStorage(res.data);
  },

  // PUT /api/users/profile — { username?, bio?, avatar? }
  updateProfile: async (payload) => {
    const res = await backendAPI.put("/users/profile", payload);
    return syncStorage(res.data);
  },

  // PUT /api/users/change-password
  changePassword: async (currentPassword, newPassword) => {
    const res = await backendAPI.put("/users/change-password", {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};