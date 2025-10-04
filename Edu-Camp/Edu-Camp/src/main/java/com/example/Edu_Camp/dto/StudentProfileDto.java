package com.example.Edu_Camp.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class StudentProfileDto {
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Phone number must be valid")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Size(min = 10, max = 200, message = "Address must be between 10 and 200 characters")
    private String address;

    @NotBlank(message = "Emergency contact is required")
    private String emergencyContact;

    // Updated fields: removed academicLevel and major, added grade and dateOfBirth
    @NotBlank(message = "Grade is required")
    @Size(max = 20, message = "Grade must not exceed 20 characters")
    private String grade;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    // Getters and Setters
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}