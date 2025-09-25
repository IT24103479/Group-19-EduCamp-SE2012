package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.LoginDto;
import com.example.Edu_Camp.dto.RegistrationDto;
import com.example.Edu_Camp.dto.UserResponseDto;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.services.AuthService;
import com.example.Edu_Camp.services.SessionService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/educamp/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private SessionService sessionService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationDto registrationDto,
                                          BindingResult bindingResult,
                                          HttpSession session) {

        // Check for validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        // Attempt registration
        UserResponseDto userResponse = authService.registerUser(registrationDto, bindingResult);

        if (userResponse == null) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        // Auto-login after successful registration
        User user = new User();
        user.setId(userResponse.getId());
        user.setUsername(userResponse.getUsername());
        user.setRole(userResponse.getRole());
        sessionService.createUserSession(session, user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("user", userResponse);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginDto loginDto,
                                       BindingResult bindingResult,
                                       HttpSession session) {

        // Check for validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        // Attempt authentication
        User user = authService.authenticateUser(loginDto, bindingResult);

        if (user == null) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }

        // Create session
        sessionService.createUserSession(session, user);

        UserResponseDto userResponse = new UserResponseDto(
                user.getId(), user.getUsername(), user.getEmail(),
                user.getRole(), user.getCreatedAt(), user.getIsActive()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("user", userResponse);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpSession session) {
        sessionService.invalidateSession(session);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuthentication(HttpSession session) {
        if (sessionService.isLoggedIn(session)) {
            User user = sessionService.getCurrentUser(session);
            UserResponseDto userResponse = new UserResponseDto(
                    user.getId(), user.getUsername(), user.getEmail(),
                    user.getRole(), user.getCreatedAt(), user.getIsActive()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", true);
            response.put("user", userResponse);

            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", false);
            response.put("message", "Not authenticated");

            return ResponseEntity.ok(response);
        }
    }
}