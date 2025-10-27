package com.example.Edu_Camp.config;

import com.example.Edu_Camp.models.Student;
import com.example.Edu_Camp.repository.StudentRepository;
import com.example.Edu_Camp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if test user already exists
        if (!userRepository.existsByEmail("anura@gmail.com")) {
            createTestStudent();
        } else {
            logger.info("Test user anura@gmail.com already exists");
            System.out.println("ℹ️ Test user anura@gmail.com already exists in database");
            System.out.println("📧 Login credentials: anura@gmail.com / DsD123@2004");
        }
    }

    private void createTestStudent() {
        try {
            String testPassword = "DsD123@2004";
            logger.info("Creating test student: anura@gmail.com");
            logger.info("=== TEST USER CREDENTIALS ===");
            logger.info("Email: anura@gmail.com");
            logger.info("Password: {}", testPassword);
            logger.info("============================");
            
            // Also print to console for visibility
            System.out.println("=== TEST USER CREATED ===");
            System.out.println("Email: anura@gmail.com");
            System.out.println("Password: " + testPassword);
            System.out.println("========================");

            Student testStudent = new Student(
                "Anura",                                    // firstName
                "Test",                                     // lastName
                "anura@gmail.com",                         // email
                passwordEncoder.encode(testPassword),       // password (encoded)
                generateStudentNumber(),                    // studentNumber
                "+94771234567",                            // phoneNumber
                LocalDate.of(2004, 1, 1),                 // dateOfBirth
                "Male"                                      // gender
            );

            testStudent.setGrade("Grade 12");
            testStudent.setAddress("Test Address, Colombo");
            testStudent.setEmergencyContact("+94771234567");
            testStudent.setIsActive(true);

            studentRepository.save(testStudent);
            logger.info("Test student created successfully: anura@gmail.com");
            System.out.println("✅ Test student saved to database successfully!");

        } catch (Exception e) {
            logger.error("Failed to create test student", e);
            System.out.println("❌ Failed to create test student: " + e.getMessage());
        }
    }

    private String generateStudentNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        long totalStudents = studentRepository.count();
        int nextNumber = (int) (totalStudents + 1);
        return String.format("STU%s%04d", year, nextNumber);
    }
}