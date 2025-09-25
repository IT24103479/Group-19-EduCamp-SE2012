package com.example.Edu_Camp.services;

import com.example.Edu_Camp.dto.LoginDto;
import com.example.Edu_Camp.dto.RegistrationDto;
import com.example.Edu_Camp.dto.UserResponseDto;
import com.example.Edu_Camp.models.Role;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionService sessionService;

    public UserResponseDto registerUser(RegistrationDto registrationDto, BindingResult bindingResult) {
        // Validate passwords match
        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            bindingResult.addError(new FieldError("registrationDto", "confirmPassword", "Passwords do not match"));
            return null;
        }

        // Check if username already exists
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            bindingResult.addError(new FieldError("registrationDto", "username", "Username already exists"));
            return null;
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            bindingResult.addError(new FieldError("registrationDto", "email", "Email already exists"));
            return null;
        }

        // Validate role
        if (registrationDto.getRole() == null) {
            bindingResult.addError(new FieldError("registrationDto", "role", "Role is required"));
            return null;
        }

        // Create new user
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setPassword(passwordEncoder.encode(registrationDto.getPassword()));
        user.setRole(registrationDto.getRole());

        User savedUser = userRepository.save(user);

        return convertToUserResponseDto(savedUser);
    }

    public User authenticateUser(LoginDto loginDto, BindingResult bindingResult) {
        Optional<User> userOptional = userRepository.findByUsernameOrEmail(
                loginDto.getUsernameOrEmail(),
                loginDto.getUsernameOrEmail()
        );

        if (userOptional.isEmpty()) {
            bindingResult.addError(new FieldError("loginDto", "usernameOrEmail", "Invalid username/email or password"));
            return null;
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            bindingResult.addError(new FieldError("loginDto", "password", "Invalid username/email or password"));
            return null;
        }

        if (!user.getIsActive()) {
            bindingResult.addError(new FieldError("loginDto", "usernameOrEmail", "Account is deactivated"));
            return null;
        }

        return user;
    }

    private UserResponseDto convertToUserResponseDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.getIsActive()
        );
    }
}