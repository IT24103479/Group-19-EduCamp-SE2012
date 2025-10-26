import axios from "axios";

// Use Vite env var when present; otherwise default to your Railway backend.
// Trim trailing slash to avoid double-slash when using api.get('/path')
export const API_BASE =
  ((import.meta.env.VITE_BACKEND_URL as string) ||
    "https://group-19-educamp-se2012-production.up.railway.app").replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});