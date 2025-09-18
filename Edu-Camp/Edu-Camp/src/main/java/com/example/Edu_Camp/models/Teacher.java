package com.example.Edu_Camp.models;
import jakarta.persistence.*;
@Entity
@Table(name = "teachers")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;
    private String subject;
    private String phone;
    private String address;

    public Teacher() {}

    public Teacher(String name,String email,String subject,String phone,String address){

    }
}