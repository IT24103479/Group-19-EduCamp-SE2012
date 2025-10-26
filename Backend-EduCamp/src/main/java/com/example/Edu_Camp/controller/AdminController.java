package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.AdminDto;
import com.example.Edu_Camp.services.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getAdminProfile(@PathVariable Long userId) {
        AdminDto adminDto = adminService.getAdminByUserId(userId);
        if (adminDto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(adminDto);
    }

}
