package com.example.Edu_Camp.services;

import com.example.Edu_Camp.dto.*;
import com.example.Edu_Camp.models.*;
import com.example.Edu_Camp.repository.*;
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

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionService sessionService;
    private final EmailService emailService;

    @Autowired
    public AuthService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       TeacherRepository teacherRepository,
                       AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       SessionService sessionService,
                       @Autowired(required = false) EmailService emailService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.emailService = emailService;
    }

    public Map<String, String> validateStudentRegistration(StudentRegistrationDto registrationDto) {
        Map<String, String> errors = new HashMap<>();

        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            errors.put("email", "Email is already registered");
        }

        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            errors.put("confirmPassword", "Passwords do not match");
        }

        if (registrationDto.getPassword().length() < 8) {
            errors.put("password", "Password must be at least 8 characters long");
        }

        return errors;
    }

    public Map<String, String> validateTeacherRegistration(TeacherRegistrationDto registrationDto) {
        Map<String, String> errors = new HashMap<>();

        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            errors.put("email", "Email is already registered");
        }

        if (registrationDto.getPassword().length() < 8) {
            errors.put("password", "Password must be at least 8 characters long");
        }

        return errors;
    }

    public Map<String, String> validateAdminRegistration(AdminRegistrationDto registrationDto) {
        Map<String, String> errors = new HashMap<>();

        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            errors.put("email", "Email is already registered");
        }

        if (!registrationDto.getPassword().equals(registrationDto.getConfirmPassword())) {
            errors.put("confirmPassword", "Passwords do not match");
        }

        if (registrationDto.getPassword().length() < 8) {
            errors.put("password", "Password must be at least 8 characters long");
        }

        return errors;
    }

    @Transactional
    public AuthResponseDto registerStudent(StudentRegistrationDto registrationDto) {
        try {
            String studentNumber = generateStudentNumber();

            Student student = new Student(
                    registrationDto.getFirstName(),
                    registrationDto.getLastName(),
                    registrationDto.getEmail().toLowerCase(),
                    passwordEncoder.encode(registrationDto.getPassword()),
                    studentNumber,
                    registrationDto.getPhoneNumber(),
                    registrationDto.getDateOfBirth(),
                    registrationDto.getGender()
            );

            student.setGrade("Not Assigned");
            student.setAddress("");
            student.setEmergencyContact("");

            Student savedStudent = studentRepository.save(student);
            UserDto userDto = convertToUserDto(savedStudent);

            return new AuthResponseDto(true, "Student registration successful", userDto);

        } catch (Exception e) {
            throw new RuntimeException("Student registration failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public AuthResponseDto registerTeacher(TeacherRegistrationDto registrationDto) {
        try {
            if (userRepository.existsByEmail(registrationDto.getEmail())) {
                throw new RuntimeException("Email already registered");
            }

            // Generate teacher number automatically
            String teacherNumber = generateTeacherNumber();

            // Generate temporary password and send login link
            String tempPassword = generateTemporaryPassword();
            String encodedPassword = passwordEncoder.encode(tempPassword);

            Teacher teacher = new Teacher(
                    registrationDto.getFirstName(),
                    registrationDto.getLastName(),
                    registrationDto.getEmail().toLowerCase(),
                    encodedPassword, // Use temporary password
                    teacherNumber, // Use auto-generated number instead of registrationDto.getTeacherNumber()
                    registrationDto.getPhoneNumber(),
                    registrationDto.getQualification(),
                    registrationDto.getDateOfBirth(),
                    registrationDto.getImage(),
                    registrationDto.getSubjectName()
            );

            Teacher savedTeacher = teacherRepository.save(teacher);

            // Send login email with temporary password - DISABLED FOR NOW
            // if (emailService != null) {
            //     emailService.sendTeacherLoginLink(savedTeacher.getEmail(), tempPassword);
            // }

            UserDto userDto = convertToUserDto(savedTeacher);
            return new AuthResponseDto(true, "Teacher registration successful. Temporary password: " + tempPassword, userDto);

        } catch (Exception e) {
            throw new RuntimeException("Teacher registration failed: " + e.getMessage(), e);
        }
    }


    @Transactional
    public AuthResponseDto registerAdmin(AdminRegistrationDto registrationDto) {
        try {
            Admin admin = new Admin(
                    registrationDto.getFirstName(),
                    registrationDto.getLastName(),
                    registrationDto.getEmail().toLowerCase(),
                    passwordEncoder.encode(registrationDto.getPassword()),
                    registrationDto.getAdminLevel()
            );

            Admin savedAdmin = adminRepository.save(admin);
            UserDto userDto = convertToUserDto(savedAdmin);

            return new AuthResponseDto(true, "Admin registration successful", userDto);

        } catch (Exception e) {
            throw new RuntimeException("Admin registration failed: " + e.getMessage(), e);
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

            String sessionId = sessionService.createSession(user);

            UserDto userDto = convertToUserDto(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", userDto);
            response.put("sessionId", sessionId);

            return response;

        } catch (Exception e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    public void logout(String sessionId) {
        sessionService.invalidateSession(sessionId);
    }

    public User getAuthenticatedUser(String sessionId) {
        return sessionService.getUserFromSession(sessionId);
    }

    private String generateStudentNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        long totalStudents = studentRepository.count();
        int nextNumber = (int) (totalStudents + 1);
        String studentNumber = String.format("STU%s%04d", year, nextNumber);

        int attempts = 0;
        while (studentRepository.existsByStudentNumber(studentNumber) && attempts < 50) {
            nextNumber++;
            studentNumber = String.format("STU%s%04d", year, nextNumber);
            attempts++;
        }

        if (studentRepository.existsByStudentNumber(studentNumber)) {
            studentNumber = "STU" + year + "X" + System.currentTimeMillis() % 10000;
        }

        return studentNumber;
    }

    private String generateTeacherNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        long totalTeachers = teacherRepository.count();
        int nextNumber = (int) (totalTeachers + 1);
        String teacherNumber = String.format("TCH%s%03d", year, nextNumber);

        int attempts = 0;
        while (teacherRepository.existsByTeacherNumber(teacherNumber) && attempts < 50) {
            nextNumber++;
            teacherNumber = String.format("TCH%s%03d", year, nextNumber);
            attempts++;
        }
        if (teacherRepository.existsByTeacherNumber(teacherNumber)) {
            teacherNumber = "TCH" + year + "X" + System.currentTimeMillis() % 10000;
        }
        return teacherNumber;
    }

    private String generateTemporaryPassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
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

        if (user instanceof Student) {
            userDto.setStudentNumber(((Student) user).getStudentNumber());
        } else if (user instanceof Teacher) {
            Teacher t = (Teacher) user;
            userDto.setTeacherNumber(t.getTeacherNumber());
            userDto.setPhoneNumber(t.getPhoneNumber());
            userDto.setQualification(t.getQualification());
            userDto.setSubjectName(t.getSubjectName());
        } else if (user instanceof Admin) {
            userDto.setAdminLevel(((Admin) user).getAdminLevel());
        }

        return userDto;
    }
}