package com.example.Edu_Camp.services;

import com.example.Edu_Camp.dto.AdminDto;
import com.example.Edu_Camp.models.Admin;
import com.example.Edu_Camp.repository.AdminRepository;
import org.springframework.stereotype.Service;
import com.example.Edu_Camp.models.User;

import java.time.LocalDate;
import java.util.Optional;
import com.example.Edu_Camp.repository.UserRepository;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository, UserRepository userRepository) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
    }


    public AdminDto getAdminByUserId(Long id) {
        // Admin extends User and shares the same primary key id (user_id),
        // so we can fetch the Admin by its id.
        Optional<Admin> adminOpt = adminRepository.findById(id);
        if (adminOpt.isEmpty()) {
            return null;
        }

        Admin admin = adminOpt.get();

        // Fetch the User entity using userId
        Optional<User> userOpt = userRepository.findById(admin.getId());
        User user = userOpt.orElse(null);
        if (user == null) {
            return null; // or handle the case where User is not found
        }

        AdminDto dto = new AdminDto();
        dto.setId(admin.getId());
        dto.setUserId(admin.getId()); // Set userId as well
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        
        // Set qualification with default value if null or empty
        String qualification = admin.getqualification();
        dto.setQualification(qualification != null && !qualification.trim().isEmpty() ? 
            qualification : "Master's Degree in Administration");
        
        // Set position with default value
        dto.setPosition("System Administrator");
        
        // Set phone with default if null or empty
        String phone = admin.getPhone();
        dto.setPhone(phone != null && !phone.trim().isEmpty() ? 
            phone : "077-555-0100");
        
        // Set address with default if null or empty
        String address = admin.getAddress();
        dto.setAddress(address != null && !address.trim().isEmpty() ? 
            address : "123 Thalawa Rd, Ginigathhena");
        
        // Set birthday with default if null (using admin's creation date or a default)
        dto.setBirthday(admin.getBirthday() != null ? 
            admin.getBirthday() : java.time.LocalDate.of(1995, 1, 15));
        
        // Set joining date with default if null (using admin's creation date or default)
        dto.setJoiningDate(admin.getJoiningDate() != null ? 
            admin.getJoiningDate() : 
            (admin.getCreatedAt() != null ? admin.getCreatedAt().toLocalDate() : java.time.LocalDate.of(2023, 1, 1)));
        
        dto.setCreatedAt(admin.getCreatedAt());
        dto.setUpdatedAt(admin.getUpdatedAt());

        return dto;
    }


    // Optional: Create, update admin methods if needed
}
