import axios from "axios";

// Use Vite env var when present; otherwise default to your Railway backend.
// Trim trailing slash to avoid double-slash when using api.get('/path')
export const API_BASE =
  ((import.meta.env.VITE_BACKEND_URL as string) ||
    "https://group-19-educamp-se2012-production.up.railway.app").replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true, // Include cookies
});

// Add request interceptor to include authentication headers
api.interceptors.request.use((config) => {
  // Add Bearer token if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add session ID if available
  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    config.headers["X-Session-Id"] = sessionId;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});