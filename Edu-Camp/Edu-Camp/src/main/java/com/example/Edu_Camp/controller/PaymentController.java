package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.Enrollment;
import com.example.Edu_Camp.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @PostMapping("/pay/{enrollmentId}")
    public String pay(@PathVariable Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId).orElseThrow();

        // TODO: Call PayPal SDK to create payment
        // Return PayPal approval URL
        return "https://www.sandbox.paypal.com/checkoutnow?token=EXAMPLETOKEN";
    }

    @GetMapping("/success")
    public String success(@RequestParam Long enrollmentId, @RequestParam String paymentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId).orElseThrow();
        enrollment.setPaymentCompleted(true);
        enrollment.setPaypalTransactionId(paymentId);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollmentRepository.save(enrollment);

        return "Payment successful! Materials unlocked for class.";
    }
}
