package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.dto.MaterialDTO;
import com.example.Edu_Camp.models.TeacherMaterial;
import com.example.Edu_Camp.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*") // adjust as needed
public class MaterialController {

    @Autowired
    private MaterialRepository materialRepository;

    // Get all materials (without sending the file data)
    @GetMapping
    public ResponseEntity<List<MaterialDTO>> getAllMaterials() {
        List<TeacherMaterial> materials = materialRepository.findAll();

        // Map to DTO to avoid sending large byte arrays
        List<MaterialDTO> response = materials.stream().map(m -> {
            MaterialDTO dto = new MaterialDTO();
            dto.setId(m.getId());
            dto.setTitle(m.getTitle());
            dto.setDescription(m.getDescription());
            dto.setSubject(m.getSubject());
            dto.setClassName(m.getClassName());
            dto.setFileName(m.getFileName());
            return dto;
        }).toList();

        return ResponseEntity.ok(response);
    }

    // Upload material via JSON body
    @PostMapping
    public ResponseEntity<?> uploadMaterial(@RequestBody MaterialDTO request) {
        try {
            if (request.getFileData() == null || request.getFileData().isEmpty()) {
                return ResponseEntity.badRequest().body("fileData is required");
            }

            byte[] fileBytes = Base64.getDecoder().decode(request.getFileData());

            TeacherMaterial material = new TeacherMaterial(
                    request.getTitle(),
                    request.getDescription(),
                    request.getSubject(),
                    request.getClassName(),
                    request.getFileName(),
                    fileBytes
            );

            materialRepository.save(material);

            MaterialDTO dto = new MaterialDTO();
            dto.setId(material.getId());
            dto.setTitle(material.getTitle());
            dto.setDescription(material.getDescription());
            dto.setSubject(material.getSubject());
            dto.setClassName(material.getClassName());
            dto.setFileName(material.getFileName());
            dto.setFileUrl("http://localhost:8080/api/materials/download/" + material.getId());

            return ResponseEntity.ok(dto);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid Base64 file data");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to save material: " + e.getMessage());
        }
    }



    // Delete material by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id) {
        Optional<TeacherMaterial> materialOptional = materialRepository.findById(id);
        if (materialOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        materialRepository.delete(materialOptional.get());
        return ResponseEntity.ok("Material deleted successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMaterial(@PathVariable Long id) {
        Optional<TeacherMaterial> materialOptional = materialRepository.findById(id);

        if (materialOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TeacherMaterial material = materialOptional.get();

        // Return file as downloadable attachment
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + material.getFileName() + "\"")
                .header("Content-Type", "application/octet-stream")
                .body(material.getFileData());
    }
    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadMaterial(@PathVariable Long id) {
        Optional<TeacherMaterial> materialOptional = materialRepository.findById(id);

        if (materialOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        TeacherMaterial material = materialOptional.get();

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + material.getFileName() + "\"")
                .header("Content-Type", "application/octet-stream")
                .body(material.getFileData());
    }

}