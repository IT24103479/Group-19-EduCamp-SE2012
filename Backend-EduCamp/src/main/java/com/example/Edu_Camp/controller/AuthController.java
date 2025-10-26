package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.*;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.services.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    // Cookie configuration
    private static final String SESSION_COOKIE_NAME = "sessionId";
    private static final int SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours
    private static final String COOKIE_PATH = "/";

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Common validation method to reduce code duplication
    private ResponseEntity<?> handleValidationErrors(BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = bindingResult.getFieldErrors()
                    .stream()
                    .collect(Collectors.toMap(
                            error -> error.getField(),
                            error -> error.getDefaultMessage(),
                            (existing, replacement) -> existing
                    ));

            logger.warn("Validation failed with {} errors", errors.size());
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Validation failed", "errors", errors)
            );
        }
        return null;
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody StudentRegistrationDto registrationDto,
                                             BindingResult bindingResult) {
        logger.info("Received registerStudent DTO: {}", registrationDto);
        // Handle validation errors
        ResponseEntity<?> validationError = handleValidationErrors(bindingResult);
        if (validationError != null) return validationError;

        // Business validation
        var businessErrors = authService.validateStudentRegistration(registrationDto);
        if (!businessErrors.isEmpty()) {
            logger.warn("Student registration business validation failed: {}", businessErrors);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Registration validation failed", "errors", businessErrors)
            );
        }

        try {
            AuthResponseDto response = authService.registerStudent(registrationDto);
            logger.info("Student registered successfully: {}", registrationDto.getEmail());
            System.out.println("Registering student: email=" + registrationDto.getEmail());
            if (registrationDto.getEmail() == null || registrationDto.getEmail().isBlank()) {
                throw new IllegalArgumentException("Email missing in DTO");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Student registration failed for email: {}", registrationDto.getEmail(), e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @PostMapping("/register/teacher")
    public ResponseEntity<?> registerTeacher(@Valid @RequestBody TeacherRegistrationDto registrationDto,
                                             BindingResult bindingResult) {
        ResponseEntity<?> validationError = handleValidationErrors(bindingResult);
        if (validationError != null) return validationError;

        var businessErrors = authService.validateTeacherRegistration(registrationDto);
        if (!businessErrors.isEmpty()) {
            logger.warn("Teacher registration business validation failed: {}", businessErrors);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Registration validation failed", "errors", businessErrors)
            );
        }

        try {
            AuthResponseDto response = authService.registerTeacher(registrationDto);
            logger.info("Teacher registered successfully: {}", registrationDto.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Teacher registration failed for email: {}", registrationDto.getEmail(), e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody AdminRegistrationDto registrationDto,
                                           BindingResult bindingResult) {
        ResponseEntity<?> validationError = handleValidationErrors(bindingResult);
        if (validationError != null) return validationError;

        var businessErrors = authService.validateAdminRegistration(registrationDto);
        if (!businessErrors.isEmpty()) {
            logger.warn("Admin registration business validation failed: {}", businessErrors);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Registration validation failed", "errors", businessErrors)
            );
        }

        try {
            AuthResponseDto response = authService.registerAdmin(registrationDto);
            logger.info("Admin registered successfully: {}", registrationDto.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Admin registration failed for email: {}", registrationDto.getEmail(), e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto,
                                   HttpServletResponse response,
                                   HttpServletRequest request) {

        // Get client IP first
        String clientIP = getClientIP(request);
        logger.info("Login attempt from IP: {} for email: {}", clientIP, loginDto.getEmail());

        try {
            Map<String, Object> loginResult = authService.login(loginDto);
            String sessionId = (String) loginResult.get("sessionId");

            logger.info("Login successful for user: {} from IP: {}", loginDto.getEmail(), clientIP);

            // Create secure session cookie
            Cookie sessionCookie = createSessionCookie(sessionId, true);
            response.addCookie(sessionCookie);

            return ResponseEntity.ok(loginResult);

        } catch (Exception e) {
            logger.warn("Login failed for email: {} from IP: {} - {}",
                    loginDto.getEmail(), clientIP, e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    Map.of("success", false, "message", "Login failed: " + e.getMessage())
            );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            String sessionId = extractSessionId(request);
            if (sessionId != null) {
                authService.logout(sessionId);

                // Clear the session cookie
                Cookie sessionCookie = createSessionCookie("", false);
                sessionCookie.setMaxAge(0); // Immediately expire
                response.addCookie(sessionCookie);

                logger.info("Logout successful for session: {}", sessionId);
            } else {
                logger.warn("Logout attempted without valid session");
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Logout successful"));

        } catch (Exception e) {
            logger.error("Logout failed", e);
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Logout failed: " + e.getMessage())
            );
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            System.out.println("Session ID in /me: " + sessionId);

            if (sessionId == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Not authenticated")
                );
            }

            User user = authService.getAuthenticatedUser(sessionId);
            System.out.println("User retrieved: " + (user != null ? user.getEmail() : "null"));

            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Session expired")
                );
            }

            // Return simple user info without complex conversion
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("email", user.getEmail());
            userInfo.put("firstName", user.getFirstName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("role", user.getRole());
            userInfo.put("active", user.getIsActive());

            return ResponseEntity.ok(Map.of("success", true, "user", userInfo));

        } catch (Exception e) {
            System.out.println("Error in /me: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                    Map.of("success", false, "message", "Error retrieving user: " + e.getMessage())
            );
        }
    }

    // Enhanced cookie creation with security best practices
    private Cookie createSessionCookie(String sessionId, boolean isLogin) {
        Cookie sessionCookie = new Cookie(SESSION_COOKIE_NAME, sessionId);
        sessionCookie.setHttpOnly(true); // Prevent XSS access
        sessionCookie.setSecure(isSecure()); // HTTPS only in production
        sessionCookie.setPath(COOKIE_PATH);
        sessionCookie.setAttribute("SameSite", "Lax"); // CSRF protection

        if (isLogin) {
            sessionCookie.setMaxAge(SESSION_MAX_AGE);
        }

        return sessionCookie;
    }

    // Environment-aware security settings
    private boolean isSecure() {
        String profile = System.getenv("SPRING_PROFILES_ACTIVE");
        return "prod".equals(profile) || "production".equals(profile);
    }

    private String extractSessionId(HttpServletRequest request) {
        // Check cookies first (primary method)
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (SESSION_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        // Check Authorization header (fallback)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // Check custom header (alternative)
        return request.getHeader("X-Session-Id");
    }

    // Enhanced IP extraction for proxy environments
    private String getClientIP(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "X-Real-IP",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_CLIENT_IP",
                "HTTP_X_FORWARDED_FOR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (isValidIP(ip)) {
                // X-Forwarded-For can contain multiple IPs, take the first one
                return ip.split(",")[0].trim();
            }
        }

        return request.getRemoteAddr();
    }

    private boolean isValidIP(String ip) {
        return ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip);
    }

    // Additional endpoint for session health check
    @GetMapping("/session/check")
    public ResponseEntity<?> checkSession(HttpServletRequest request) {
        try {
            String sessionId = extractSessionId(request);
            if (sessionId == null) {
                return ResponseEntity.ok(Map.of("valid", false, "message", "No session"));
            }

            var user = authService.getAuthenticatedUser(sessionId);
            boolean isValid = user != null;

            return ResponseEntity.ok(Map.of(
                    "valid", isValid,
                    "user", isValid ? user : null,
                    "message", isValid ? "Session valid" : "Session invalid"
            ));

        } catch (Exception e) {
            logger.error("Session check failed", e);
            return ResponseEntity.ok(Map.of("valid", false, "message", "Error checking session"));
        }
    }
}