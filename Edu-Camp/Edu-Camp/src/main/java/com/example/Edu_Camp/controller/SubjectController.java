package com.example.Edu_Camp.controller;


import com.example.Edu_Camp.models.Subject;
import com.example.Edu_Camp.repository.SubjectRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/subjects") //API endpoint for subjects

public class SubjectController {

    private final SubjectRepository repository;

    public SubjectController(SubjectRepository repository) {
        this.repository=repository;
    }

    //Get all subjects
    @GetMapping("/{id}")
    public Subject getSubjectById(@PathVariable Long id){
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    public Subject createSubject(@RequestBody Subject subject){
        return repository.save(subject);
    }

    @GetMapping("/search")
    public List<Subject> searchSubjects(@RequestParam String name){
        return repository.findByNameContainingIgnoreCase(name);
    }
}

