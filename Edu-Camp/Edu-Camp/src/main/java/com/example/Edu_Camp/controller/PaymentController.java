package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.Payment;
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
        Payment payment = enrollmentRepository.findById(enrollmentId).orElseThrow();

        // TODO: Call PayPal SDK to create payment
        // Return PayPal approval URL
        return "https://www.sandbox.paypal.com/checkoutnow?token=EXAMPLETOKEN";
    }

    @GetMapping("/success")
    public String success(@RequestParam Long enrollmentId, @RequestParam String paymentId) {
        Payment payment = enrollmentRepository.findById(enrollmentId).orElseThrow();
        payment.setPaymentCompleted(true);
        payment.setPaypalTransactionId(paymentId);
        payment.setEnrollmentDate(LocalDateTime.now());
        enrollmentRepository.save(payment);

        return "Payment successful! Materials unlocked for class.";
    }
}
