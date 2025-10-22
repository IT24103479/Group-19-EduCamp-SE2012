package com.example.Edu_Camp.repository;

import com.example.Edu_Camp.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
    Optional<Payment> findByPaypalOrderId(String paypalOrderId);
}
