package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.util.List;


@Entity
@Table(name="subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    private String name;

    //list of classes associated with this subject
    @OneToMany(mappedBy="Subject")
    private List<ClassEntity> classes;

    public Subject() {}

    //getters and setters
    public Long getId() {
        return id; }
    public void setId(Long id){
        this.id=id;
    }

    public String getName(){
        return name;
    }
    public void setName(String name){
        this.name=name;
    }

    public List<ClassEntity> getClasses() {
        return classes;
    }
    public void setClasses(List<ClassEntity> classes){}
}
