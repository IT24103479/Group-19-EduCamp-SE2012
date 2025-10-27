import React, { createContext, useContext, useState, useEffect } from "react";
import { api, API_BASE } from "../lib/api";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_ID_KEY));
  const [loading, setLoading] = useState(false);

  // Fetch user from session on mount
  useEffect(() => {
    api
      .get(`/api/auth/me`)
      .then((res) => {
        console.log("🔑 /me response:", res.data);
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
          // Session ID is handled by cookies, no need to manually manage it
        } else {
          setUser(null);
        }
      })
      .catch((err) => {
        // 401 is expected when user is not logged in, don't log as error
        if (err.response?.status === 401) {
          console.log("No valid session found, user not authenticated");
        } else {
          console.error("❌ Failed to fetch /me:", err);
        }
        setUser(null);
      });
  }, []);

  const logout = () => {
    setUser(null);
    setSessionId(null);
    localStorage.removeItem(SESSION_ID_KEY);
    // Call backend to destroy session
    api.post(`/api/auth/logout`)
      .catch((err) => console.error("Logout error:", err));
  };
  const value: AuthContextType = {
    user,
    token: localStorage.getItem("token"),
    sessionId,
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