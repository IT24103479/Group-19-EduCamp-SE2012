package com.example.Edu_Camp.controller;

//bridge between java code and MySQL

import com.example.Edu_Camp.models.ClassEntity;
import com.example.Edu_Camp.repository.ClassRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController //HTTP requests and return Json data
@RequestMapping("/classes") 

//spring boot talk to the database without having to create it manually
public class ClassController{
    private final ClassRepository repository;

    public ClassController(ClassRepository repository){

        this.repository=repository;
    }

    @GetMapping
    public List<ClassEntity> getAllClasses(){

        return repository.findAll();
    }
    @GetMapping("/search")//responds to http get request

    public List<ClassEntity> searchBySubject(@RequestParam String subject){
        return repository.findBySubjectContainingIgnoreCase(subject);
    }
}