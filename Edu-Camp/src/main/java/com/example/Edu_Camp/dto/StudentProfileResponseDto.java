package com.example.Edu_Camp.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class StudentProfileResponseDto {
    // Read-only
    private Long id;
    private String studentNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String grade;
    private String[] assignedCourses;
    private String gender;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int age;
    private boolean underage;

    // Editable
    private String phoneNumber;
    private String emergencyContact;
    private String address;
    private LocalDate dateOfBirth;
    private String profilePicture;

    // Getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentNumber() { return studentNumber; }
    public void setStudentNumber(String studentNumber) { this.studentNumber = studentNumber; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String[] getAssignedCourses() { return assignedCourses; }
    public void setAssignedCourses(String[] assignedCourses) { this.assignedCourses = assignedCourses; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public boolean isUnderage() { return underage; }
    public void setUnderage(boolean underage) { this.underage = underage; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
}