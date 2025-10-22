package com.example.Edu_Camp.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


public class AdminDto extends UserDto {
    private Long id;
    private Long userId;
    private String name;
    private String position;
    private String phone;
    private String address;
    private LocalDate birthday;
    private LocalDate joiningDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    public Long getId() {return id;}
    public void setId(Long id) {this.id = id;}
    public Long getUserId() {return userId;}
    public void setUserId(Long userId) {this.userId = userId;}
    public String getName() {return name;}
    public void setName(String name) {this.name = name;}
    public String getPosition() {return position;}
    public void setPosition(String position) {this.position = position;}
    public String getPhone() {return phone;}
    public void setPhone(String phone) {this.phone = phone;}
    public String getAddress() {return address;}
    public void setAddress(String address) {this.address = address;}
    public LocalDate getBirthday() {return birthday;}
    public void setBirthday(LocalDate birthday) {this.birthday = birthday;}
    public LocalDate getJoiningDate() {return joiningDate;}
    public void setJoiningDate(LocalDate joiningDate) {this.joiningDate = joiningDate;}
    public LocalDateTime getCreatedAt() {return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}
    public LocalDateTime getUpdatedAt() {return updatedAt;}
    public void setUpdatedAt(LocalDateTime updatedAt) {this.updatedAt = updatedAt;}
public void getAdmins(List<AdminDto> adminDtos) {
    }

    // Getters & Setters
}
