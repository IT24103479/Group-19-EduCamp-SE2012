package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.PaymentDTO;
import com.example.Edu_Camp.models.Payment;
import com.example.Edu_Camp.models.Enrollment;
import com.example.Edu_Camp.models.User;
import com.example.Edu_Camp.repository.PaymentRepository;
import com.example.Edu_Camp.services.PayPalService;
import com.example.Edu_Camp.services.EnrollmentService;
import com.example.Edu_Camp.services.AuthService;
import jakarta.validation.Valid;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final PayPalService paypalService;
    private final PaymentRepository paymentRepository;
    private final EnrollmentService enrollmentService;
    private final AuthService authService;

    public PaymentController(PayPalService paypalService, PaymentRepository paymentRepository, EnrollmentService enrollmentService, AuthService authService) {
        this.paypalService = paypalService;
        this.paymentRepository = paymentRepository;
        this.enrollmentService = enrollmentService;
        this.authService = authService;
    }

    // Get all payments
    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    //  Get payment by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        Optional<Payment> payment = paymentRepository.findById(id);
        return payment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPaymentsByUserId(@PathVariable Long userId) {
        List<Payment> payments = paymentRepository.findByUserId(userId);

        if (payments.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No payments found for user " + userId));
        }

        return ResponseEntity.ok(payments);
    }

    //  Create payment (PayPal order)
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@Valid @RequestBody PaymentDTO paymentDTO) {
        Payment payment = paypalService.createOrder(paymentDTO);
        return ResponseEntity.ok(payment);
    }

    //  Update payment (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePayment(@PathVariable Long id, @Valid @RequestBody PaymentDTO paymentDTO) {
        Optional<Payment> optionalPayment = paymentRepository.findById(id);
        if (optionalPayment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Payment payment = optionalPayment.get();
        payment.setAmount(paymentDTO.getAmount());
        payment.setCurrency(paymentDTO.getCurrency());
        payment.setClassId(paymentDTO.getClassId());
        payment.setUserId(paymentDTO.getUserId());
        payment.setPaymentCompleted(false); // reset if updating
        Payment updatedPayment = paymentRepository.save(payment);

        return ResponseEntity.ok(updatedPayment);
    }

    //  Delete payment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        if (!paymentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        paymentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // helper to extract session id from cookie/header/authorization
    private String extractSessionId(HttpServletRequest request) {
        if (request == null) return null;
        // Check cookies
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("sessionId".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        // Check header X-Session-Id
        String headerSession = request.getHeader("X-Session-Id");
        if (headerSession != null && !headerSession.trim().isEmpty()) return headerSession;
        // Check Authorization Bearer
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    //  Capture payment (after PayPal approval)

    @PostMapping("/capture/{orderId}")
    public ResponseEntity<?> capturePayment(
            @PathVariable String orderId,
            @RequestParam(required = false) Long userId,
            HttpServletRequest request) {

        System.out.println("Incoming capture request for orderId='" + orderId + "' userId='" + userId + "'");

        // Try to resolve userId from session if not supplied
        if (userId == null) {
            String sessionId = extractSessionId(request);
            if (sessionId != null) {
                User u = authService.getAuthenticatedUser(sessionId);
                if (u != null) {
                    userId = u.getId();
                }
            }
        }

        if (userId == null) {
            return ResponseEntity.badRequest().body("Missing userId for payment capture");
        }

        try {
            Payment payment = paypalService.capturePayment(orderId);

            if (payment != null) {
                payment.setUserId(userId);
                payment.setPaymentCompleted(true);
                paymentRepository.save(payment);
            }

            enrollmentService.createEnrollmentIfNotExists(userId, payment.getClassId(), payment.getId());

            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error capturing PayPal payment");
        }
    }

    // New: Confirm payment and create enrollment from it
    @PostMapping("/confirm/{id}")
    public ResponseEntity<?> confirmPaymentAndCreateEnrollment(@PathVariable Long id, HttpServletRequest request) {
        // authenticate
        String sessionId = extractSessionId(request);
        User user = null;
        if (sessionId != null) {
            user = authService.getAuthenticatedUser(sessionId);
        }
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        // Validate payment exists
        Optional<Payment> optionalPayment = paymentRepository.findById(id);
        if (optionalPayment.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Payment not found"));
        }
        Payment payment = optionalPayment.get();

        // Ensure the payment belongs to the authenticated user
        if (payment.getUserId() == null || !payment.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Payment does not belong to the authenticated user"));
        }

        // Try to create enrollment
        try {
            Enrollment enrollment = enrollmentService.createFromPayment(id);
            return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create enrollment"));
        }
    }
}