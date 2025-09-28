package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.*;
import com.example.Edu_Camp.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationDto registrationDto,
                                      BindingResult bindingResult) {

        // Check for validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (var error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Validation failed", "errors", errors)
            );
        }

        // Check business logic errors
        Map<String, String> businessErrors = authService.validateRegistration(registrationDto);
        if (!businessErrors.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Registration validation failed", "errors", businessErrors)
            );
        }

        try {
            AuthResponseDto response = authService.register(registrationDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto,
                                   BindingResult bindingResult,
                                   HttpServletResponse response) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            for (var error : bindingResult.getFieldErrors()) {
                errors.put(error.getField(), error.getDefaultMessage());
            }
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", "Validation failed", "errors", errors)
            );
        }

        try {
            Map<String, Object> authResponse = authService.login(loginDto);

            // Set session cookie
            String sessionId = (String) authResponse.get("sessionId");
            Cookie sessionCookie = new Cookie("sessionId", sessionId);
            sessionCookie.setPath("/");
            sessionCookie.setHttpOnly(true);
            sessionCookie.setMaxAge(24 * 60 * 60); // 24 hours
            sessionCookie.setSecure(false); // Set to true in production with HTTPS
            response.addCookie(sessionCookie);

            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage())
            );
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = extractSessionId(request);
        if (sessionId != null) {
            authService.logout(sessionId);
        }

        // Clear session cookie
        Cookie sessionCookie = new Cookie("sessionId", "");
        sessionCookie.setPath("/");
        sessionCookie.setHttpOnly(true);
        sessionCookie.setMaxAge(0);
        response.addCookie(sessionCookie);

        return ResponseEntity.ok(Map.of("success", true, "message", "Logout successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String sessionId = extractSessionId(request);
        System.out.println("Extracted session ID: " + sessionId);

        if (sessionId == null) {
            return ResponseEntity.status(401).body(
                    Map.of("success", false, "message", "No session ID found")
            );
        }

        try {
            var user = authService.getAuthenticatedUser(sessionId);
            if (user == null) {
                return ResponseEntity.status(401).body(
                        Map.of("success", false, "message", "Session expired or invalid")
                );
            }

            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setFirstName(user.getFirstName());
            userDto.setLastName(user.getLastName());
            userDto.setEmail(user.getEmail());
            userDto.setRole(user.getRole());
            userDto.setIsActive(user.getIsActive());
            userDto.setCreatedAt(user.getCreatedAt());
            userDto.setStudentId(user.getStudent() != null ? user.getStudent().getStudentId() : null);

            return ResponseEntity.ok(Map.of("success", true, "message", "User found", "user", userDto));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                    Map.of("success", false, "message", "Authentication failed: " + e.getMessage())
            );
        }
    }

    private String extractSessionId(HttpServletRequest request) {
        // Check cookies first
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("sessionId".equals(cookie.getName())) {
                    System.out.println("Found session cookie: " + cookie.getValue());
                    return cookie.getValue();
                }
            }
        }

        // Check header
        String headerSession = request.getHeader("X-Session-Id");
        if (headerSession != null && !headerSession.trim().isEmpty()) {
            System.out.println("Found session header: " + headerSession);
            return headerSession;
        }

        // Check Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("Found auth header session: " + token);
            return token;
        }

        System.out.println("No session ID found in request");
        return null;
    }
}