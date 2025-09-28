package com.example.Edu_Camp.service;

import com.example.Edu_Camp.models.User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {

    private final Map<String, User> sessions = new ConcurrentHashMap<>();
    private final Map<String, Long> sessionExpiry = new ConcurrentHashMap<>();
    private static final long SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    public String createSession(User user) {
        String sessionId = UUID.randomUUID().toString();
        sessions.put(sessionId, user);
        sessionExpiry.put(sessionId, System.currentTimeMillis() + SESSION_DURATION);

        System.out.println("Session created: " + sessionId + " for user: " + user.getEmail());
        System.out.println("Total active sessions: " + sessions.size());

        return sessionId;
    }

    public User getUserFromSession(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            System.out.println("Session ID is null or empty");
            return null;
        }

        if (!sessions.containsKey(sessionId)) {
            System.out.println("Session not found: " + sessionId);
            return null;
        }

        // Check if session has expired
        Long expiryTime = sessionExpiry.get(sessionId);
        if (expiryTime == null) {
            System.out.println("Session expiry time not found: " + sessionId);
            invalidateSession(sessionId);
            return null;
        }

        if (System.currentTimeMillis() > expiryTime) {
            System.out.println("Session expired: " + sessionId);
            invalidateSession(sessionId);
            return null;
        }

        // Refresh session expiry
        sessionExpiry.put(sessionId, System.currentTimeMillis() + SESSION_DURATION);
        User user = sessions.get(sessionId);

        System.out.println("Retrieved user: " + user.getEmail() + " from session: " + sessionId);

        return user;
    }

    public void invalidateSession(String sessionId) {
        User user = sessions.get(sessionId);
        if (user != null) {
            System.out.println("Invalidating session: " + sessionId + " for user: " + user.getEmail());
        }
        sessions.remove(sessionId);
        sessionExpiry.remove(sessionId);

        System.out.println("Remaining active sessions: " + sessions.size());
    }

    public boolean isValidSession(String sessionId) {
        User user = getUserFromSession(sessionId);
        boolean valid = user != null;
        System.out.println("Session validation for " + sessionId + ": " + valid);
        return valid;
    }

    // Clean up expired sessions
    public void cleanupExpiredSessions() {
        long currentTime = System.currentTimeMillis();
        int initialSize = sessions.size();

        sessionExpiry.entrySet().removeIf(entry -> {
            if (entry.getValue() < currentTime) {
                sessions.remove(entry.getKey());
                return true;
            }
            return false;
        });

        int removedSessions = initialSize - sessions.size();
        if (removedSessions > 0) {
            System.out.println("Cleaned up " + removedSessions + " expired sessions");
        }
    }
}