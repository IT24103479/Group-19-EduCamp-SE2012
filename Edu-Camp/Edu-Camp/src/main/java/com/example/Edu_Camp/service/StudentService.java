package com.example.Edu_Camp.service;

import com.example.Edu_Camp.dto.StudentProfileDto;
import com.example.Edu_Camp.models.Student;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public Student getStudentByUser(User user) {
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }

    public Student updateStudentProfile(User user, StudentProfileDto profileDto) {
        Student student = getStudentByUser(user);

        student.setPhoneNumber(profileDto.getPhoneNumber());
        student.setAddress(profileDto.getAddress());
        student.setEmergencyContact(profileDto.getEmergencyContact());
        student.setGrade(profileDto.getGrade());
        student.setDateOfBirth(profileDto.getDateOfBirth());

        return studentRepository.save(student);
    }
}