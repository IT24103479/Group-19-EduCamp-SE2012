package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.EnrollmentDTO;
import com.example.Edu_Camp.models.Enrollment;
import com.example.Edu_Camp.services.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Enrollment> getById(@PathVariable Long id) {
        return enrollmentService.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getByStudentId(studentId));
    }

    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<List<Enrollment>> getByPaymentId(@PathVariable Long paymentId) {
        return ResponseEntity.ok(enrollmentService.getByPaymentId(paymentId));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Enrollment>> getByClassId(@PathVariable Long classId) {
        return ResponseEntity.ok(enrollmentService.getByClassId(classId));
    }

    /**
     * New: fetch all enrollments (no auth required here; secure as needed)
     */
    @GetMapping
    public ResponseEntity<List<Enrollment>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }

    @PostMapping
    public ResponseEntity<?> createEnrollment(@RequestBody EnrollmentDTO dto) {
        try {
            Enrollment created = enrollmentService.createEnrollment(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create enrollment");
        }
    }

    /**
     * New: update an enrollment by id
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEnrollment(@PathVariable Long id, @RequestBody EnrollmentDTO dto) {
        try {
            Enrollment updated = enrollmentService.updateEnrollment(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update enrollment");
        }
    }

    /**
     * New: delete an enrollment by id
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnrollment(@PathVariable Long id) {
        try {
            enrollmentService.deleteEnrollment(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete enrollment");
        }
    }
}