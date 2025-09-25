package com.example.Edu_Camp.services;

import com.example.Edu_Camp.models.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class SessionService {
    private static final String SESSION_USER_KEY = "currentUser";
    private static final String SESSION_USER_ID_KEY = "userId";
    private static final String SESSION_USER_ROLE_KEY = "userRole";

    // In-memory session tracking (optional, for admin purposes)
    private final Map<String, HttpSession> activeSessions = new HashMap<>();

    public void createUserSession(HttpSession session, User user) {
        session.setAttribute(SESSION_USER_KEY, user);
        session.setAttribute(SESSION_USER_ID_KEY, user.getId());
        session.setAttribute(SESSION_USER_ROLE_KEY, user.getRole().name());
        session.setMaxInactiveInterval(30 * 60); // 30 minutes

        // Track active session
        activeSessions.put(session.getId(), session);
    }

    public User getCurrentUser(HttpSession session) {
        return (User) session.getAttribute(SESSION_USER_KEY);
    }

    public Long getCurrentUserId(HttpSession session) {
        return (Long) session.getAttribute(SESSION_USER_ID_KEY);
    }

    public String getCurrentUserRole(HttpSession session) {
        return (String) session.getAttribute(SESSION_USER_ROLE_KEY);
    }

    public boolean isLoggedIn(HttpSession session) {
        return getCurrentUser(session) != null;
    }

    public void invalidateSession(HttpSession session) {
        activeSessions.remove(session.getId());
        session.invalidate();
    }

    public void logoutUserEverywhere(Long userId) {
        activeSessions.values().forEach(session -> {
            Long sessionUserId = getCurrentUserId(session);
            if (userId.equals(sessionUserId)) {
                session.invalidate();
            }
        });
    }

    public int getActiveSessionsCount() {
        return activeSessions.size();
    }
}