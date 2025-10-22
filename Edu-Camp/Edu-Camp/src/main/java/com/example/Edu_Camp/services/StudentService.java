package com.example.Edu_Camp.services;

import com.example.Edu_Camp.dto.StudentProfileDto;
import com.example.Edu_Camp.dto.StudentProfileResponseDto;
import com.example.Edu_Camp.models.Student;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {
    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student getStudentByUser(User user) {
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }

    public StudentProfileResponseDto getStudentProfile(User user) {
        return convertToProfileResponseDto(getStudentByUser(user));
    }

    @Transactional
    public StudentProfileResponseDto updateStudentProfile(User user, StudentProfileDto dto) {
        Student student = getStudentByUser(user);

        // Only update editable fields - date of birth is READ-ONLY
        student.setPhoneNumber(dto.getPhoneNumber());
        student.setEmergencyContact(dto.getEmergencyContact());
        student.setAddress(dto.getAddress());
        // student.setDateOfBirth(dto.getDateOfBirth()); // REMOVED - read-only
        student.setProfilePicture(dto.getProfilePicture());

        Student updatedStudent = studentRepository.save(student);
        return convertToProfileResponseDto(updatedStudent);
    }

    private StudentProfileResponseDto convertToProfileResponseDto(Student student) {
        StudentProfileResponseDto dto = new StudentProfileResponseDto();
        dto.setId(student.getId());
        dto.setStudentNumber(student.getStudentNumber());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getEmail());
        dto.setPhoneNumber(student.getPhoneNumber());
        dto.setEmergencyContact(student.getEmergencyContact());
        dto.setAddress(student.getAddress());
        dto.setDateOfBirth(student.getDateOfBirth()); // This comes from the Student entity
        dto.setProfilePicture(student.getProfilePicture());
        dto.setGender(student.getGender());
        dto.setGrade(student.getGrade());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setUpdatedAt(student.getUpdatedAt());
        dto.setAge(student.getAge());
        dto.setUnderage(student.isUnderage());
        dto.setAssignedCourses(new String[] {"Maths", "Science"}); // placeholder

        return dto;
    }

    public boolean canEditField(String field) {
        return switch (field) {
            case "profilePicture", "phoneNumber", "emergencyContact", "address" -> true;
            case "dateOfBirth" -> false; // Explicitly false - read-only
            default -> false;
        };
    }
}