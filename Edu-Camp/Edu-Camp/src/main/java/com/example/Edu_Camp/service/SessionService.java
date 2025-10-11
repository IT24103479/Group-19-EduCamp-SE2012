package com.example.Edu_Camp.service;

import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {

    private final Map<String, User> sessions = new ConcurrentHashMap<>();
    private final Map<String, Long> sessionExpiry = new ConcurrentHashMap<>();
    private final Map<String, String> sessionIPs = new ConcurrentHashMap<>();
    private static final long SESSION_DURATION = 24 * 60 * 60 * 1000L; // 24 hours

    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    @Autowired
    public SessionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String createSession(User user) {
        return createSession(user, null);
    }

    public String createSession(User user, String ipAddress) {
        String sessionId = UUID.randomUUID().toString();

        User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found: " + user.getId()));

        // Check if user is active
        if (!freshUser.getIsActive()) {
            throw new RuntimeException("User account is deactivated");
        }

        sessions.put(sessionId, freshUser);
        sessionExpiry.put(sessionId, System.currentTimeMillis() + SESSION_DURATION);

        if (ipAddress != null) {
            sessionIPs.put(sessionId, ipAddress);
        }

        logger.info("Session created: {} for user: {} with role: {}",
                sessionId, freshUser.getEmail(), freshUser.getRole());
        logger.info("Total active sessions: {}", sessions.size());

        return sessionId;
    }

    public User getUserFromSession(String sessionId) {
        return getUserFromSession(sessionId, null);
    }

    public User getUserFromSession(String sessionId, String ipAddress) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            logger.warn("Session ID is null or empty");
            return null;
        }

        if (!sessions.containsKey(sessionId)) {
            logger.warn("Session not found: {}", sessionId);
            return null;
        }

        Long expiryTime = sessionExpiry.get(sessionId);
        if (expiryTime == null) {
            logger.warn("Session expiry time not found: {}", sessionId);
            invalidateSession(sessionId);
            return null;
        }

        if (System.currentTimeMillis() > expiryTime) {
            logger.warn("Session expired: {}", sessionId);
            invalidateSession(sessionId);
            return null;
        }

        // Refresh session expiry
        sessionExpiry.put(sessionId, System.currentTimeMillis() + SESSION_DURATION);
        User user = sessions.get(sessionId);

        // Verify user is still active
        if (!user.getIsActive()) {
            logger.warn("User account deactivated: {}", user.getEmail());
            invalidateSession(sessionId);
            return null;
        }

        logger.debug("Retrieved user: {} from session: {}", user.getEmail(), sessionId);
        return user;
    }

    public void invalidateSession(String sessionId) {
        User user = sessions.get(sessionId);
        if (user != null) {
            logger.info("Invalidating session: {} for user: {}", sessionId, user.getEmail());
        }
        sessions.remove(sessionId);
        sessionExpiry.remove(sessionId);
        sessionIPs.remove(sessionId);
        logger.info("Remaining active sessions: {}", sessions.size());
    }

    public boolean isValidSession(String sessionId) {
        User user = getUserFromSession(sessionId);
        boolean valid = user != null;
        logger.debug("Session validation for {}: {}", sessionId, valid);
        return valid;
    }

    @Scheduled(fixedRate = 60 * 60 * 1000) // every hour
    public void cleanupExpiredSessions() {
        long currentTime = System.currentTimeMillis();
        int initialSize = sessions.size();

        sessions.keySet().removeIf(sessionId -> {
            Long expiry = sessionExpiry.get(sessionId);
            if (expiry == null || expiry < currentTime) {
                sessionExpiry.remove(sessionId);
                sessionIPs.remove(sessionId);
                logger.debug("Cleaned up expired session: {}", sessionId);
                return true;
            }
            return false;
        });

        int removedSessions = initialSize - sessions.size();
        if (removedSessions > 0) {
            logger.info("Cleaned up {} expired sessions", removedSessions);
        }
    }
}