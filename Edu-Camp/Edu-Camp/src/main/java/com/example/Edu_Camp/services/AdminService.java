package com.example.Edu_Camp.services;

import com.example.Edu_Camp.dto.AdminDto;
import com.example.Edu_Camp.models.Admin;
import com.example.Edu_Camp.repository.AdminRepository;
import org.springframework.stereotype.Service;
import com.example.Edu_Camp.models.User;
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
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPosition(admin.getPosition());
        dto.setPhone(admin.getPhone());
        dto.setAddress(admin.getAddress());
        dto.setBirthday(admin.getBirthday());
        dto.setJoiningDate(admin.getJoiningDate());
        dto.setCreatedAt(admin.getCreatedAt());
        dto.setUpdatedAt(admin.getUpdatedAt());

        return dto;
    }

    // Optional: Create, update admin methods if needed
}
