package com.example.Edu_Camp.repository;


import com.example.Edu_Camp.models.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    @Query("SELECT a FROM Admin a WHERE a.id = :userId")
    Optional<Admin> findByUserId(@Param("userId") Long userId);
}