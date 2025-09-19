package com.example.Edu_Camp.repository;

import java.util.List;
import com.example.Edu_Camp.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
}

