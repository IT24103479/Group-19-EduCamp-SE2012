package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {
        if(userRepository.findByUsername(user.getUsername()).isPresent()) return "Username already exists";
        if(userRepository.findByEmail(user.getEmail()).isPresent()) return "Email already exists";

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        userRepository.save(user);
        return "User registered successfully";
    }
}

