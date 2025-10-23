package com.example.Edu_Camp.dto;

import com.example.Edu_Camp.dto.UserDto;

public class AuthResponseDto {
    private boolean success;
    private String message;
    private com.example.Edu_Camp.dto.UserDto user;

    public AuthResponseDto() {}

    public AuthResponseDto(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponseDto(boolean success, String message, com.example.Edu_Camp.dto.UserDto user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }

    // getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
}