package com.example.Edu_Camp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentDTO {

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotBlank(message = "Currency is required")
    private String currency;

    @NotNull(message = "Class ID is required")
    private Long classId;

    @NotNull(message = "User ID is required")
    private Long userId;

    private String description; // optional, for PayPal order

    // Getters and setters
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public Long getClassId() { return classId; }
    public void setClassId(Long classId) { this.classId = classId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
