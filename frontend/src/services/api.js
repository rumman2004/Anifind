// src/services/api.js
import axios from "axios";
import { API_BASE_URL, JIKAN_BASE_URL } from "../utils/constants.js";

/* ══════════════════════════════════════════════════════════
   JIKAN API
   • Public, no auth header needed
   • Built-in 429 retry (backs off 1.2 s then retries once)
══════════════════════════════════════════════════════════ */
export const jikanAPI = axios.create({
  baseURL: JIKAN_BASE_URL,   // https://api.jikan.moe/v4
  timeout: 12000,
});

jikanAPI.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err;
    if (response?.status === 429 && !config._retried) {
      config._retried = true;
      await new Promise((r) => setTimeout(r, 1200));
      return jikanAPI(config);
    }
    return Promise.reject(err);
  }
);

/* ══════════════════════════════════════════════════════════
   BACKEND API
   • Points to your Express server
   • Auto-attaches JWT from localStorage
   • Clears bad token on 401
══════════════════════════════════════════════════════════ */
export const backendAPI = axios.create({
  baseURL: API_BASE_URL,     // http://localhost:5000/api
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

/* attach token */
backendAPI.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem("anifind_user") || "null");
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      /* corrupted localStorage — skip */
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* handle expired / invalid token */
backendAPI.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("anifind_user");
      /* optionally redirect: window.location.href = "/login"; */
    }
    return Promise.reject(err);
  }
);