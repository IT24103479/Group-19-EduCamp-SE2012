import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  token?: string | null;
  sessionId?: string | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const SESSION_ID_KEY = 'sessionId';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Make axios send cookies by default (so backend session cookie is forwarded)
axios.defaults.withCredentials = true;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_ID_KEY));
  const [loading, setLoading] = useState(false);

  // Fetch user from session on mount
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/auth/me`)
      .then((res) => {
        console.log("🔑 /me response:", res.data);
        if (res.data?.authenticated) {
          setUser(res.data.user);
          setSessionId(res.data.sessionId);
          localStorage.setItem(SESSION_ID_KEY, res.data.sessionId);
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to fetch /me:", err);
        setUser(null);
      });
  }, []);

  const logout = () => {
    setUser(null);
    setSessionId(null);
    localStorage.removeItem(SESSION_ID_KEY);
    // Optionally call backend to destroy session
    axios.post(`${API_BASE}/educamp/api/auth/logout``, {});
  };

  const value: AuthContextType = {
    user,
    setUser,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

   useEffect(() => {
    // Optional: hydrate user if you also persist it
    const saved = localStorage.getItem(SESSION_ID_KEY);
    if (saved && !sessionId) setSessionId(saved);
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};