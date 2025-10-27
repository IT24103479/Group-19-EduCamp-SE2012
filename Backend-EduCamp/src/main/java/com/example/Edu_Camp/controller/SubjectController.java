package com.example.Edu_Camp.controller;

import com.example.Edu_Camp.models.Subject;
import com.example.Edu_Camp.repository.SubjectRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class SubjectController {

    private final SubjectRepository subjectRepository;

    public SubjectController(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    // GET all subjects - Public access
    @GetMapping
    @PreAuthorize("permitAll()")
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    // POST new subject (optional)
    @PostMapping
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }
}