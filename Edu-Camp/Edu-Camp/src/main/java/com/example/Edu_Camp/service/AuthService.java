package com.example.Edu_Camp.service;

import com.example.Edu_Camp.dto.*;
import com.example.Edu_Camp.models.User; // Changed from .models to .model
import com.example.Edu_Camp.models.Student; // Changed from .models to .model
import com.example.Edu_Camp.repository.UserRepository;
import com.example.Edu_Camp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionService sessionService;

    public Map<String, String> validateRegistration(RegistrationDto registrationDto) {
        Map<String, String> errors = new HashMap<>();

        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            errors.put("email", "Email is already registered");
        }

        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            errors.put("confirmPassword", "Passwords do not match");
        }

        return errors;
    }

    @Transactional
    public AuthResponseDto register(RegistrationDto registrationDto) {
        try {
            // Create user
            User user = new User();
            user.setFirstName(registrationDto.getFirstName());
            user.setLastName(registrationDto.getLastName());
            user.setEmail(registrationDto.getEmail().toLowerCase());
            user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
            user.setRole("STUDENT"); // Default role for registrations

            User savedUser = userRepository.save(user);

            // Generate unique student ID
            String studentId = generateStudentId();

            // Create student profile
            Student student = new Student(savedUser, studentId);
            studentRepository.save(student);

            // Set bidirectional relationship
            savedUser.setStudent(student);
            userRepository.save(savedUser);

            return new AuthResponseDto(true, "Registration successful");

        } catch (Exception e) {
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public Map<String, Object> login(LoginDto loginDto) {
        try {
            User user = userRepository.findByEmail(loginDto.getEmail().toLowerCase())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            if (!user.getIsActive()) {
                throw new RuntimeException("Account is deactivated");
            }

            if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }

            // Create session
            String sessionId = sessionService.createSession(user);

            // Convert to DTO
            UserDto userDto = convertToUserDto(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", userDto);
            response.put("sessionId", sessionId); // Include session ID in response

            return response;

        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    public void logout(String sessionId) {
        sessionService.invalidateSession(sessionId);
    }

    public User getAuthenticatedUser(String sessionId) {
        return sessionService.getUserFromSession(sessionId);
    }

    private String generateStudentId() {
        String year = String.valueOf(LocalDateTime.now().getYear());

        // Get total number of students and add 1
        long totalStudents = studentRepository.count();
        int nextNumber = (int) (totalStudents + 1);

        // Format: STU20240001
        String studentId = String.format("STU%s%04d", year, nextNumber);

        // Simple retry logic for safety
        int attempts = 0;
        while (studentRepository.existsByStudentId(studentId) && attempts < 50) {
            nextNumber++;
            studentId = String.format("STU%s%04d", year, nextNumber);
            attempts++;
        }

        // Final fallback
        if (studentRepository.existsByStudentId(studentId)) {
            studentId = "STU" + year + "X" + System.currentTimeMillis() % 10000;
        }

        return studentId;
    }

    private UserDto convertToUserDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole());
        userDto.setIsActive(user.getIsActive());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setStudentId(user.getStudent() != null ? user.getStudent().getStudentId() : null);
        return userDto;
    }
}