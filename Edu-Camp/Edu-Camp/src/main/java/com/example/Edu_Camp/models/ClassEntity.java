package com.example.Edu_Camp.models;


import jakarta.persistence.*; //for JPA annotations.these are what tell spring bppth how your java class should map to database

@Entity
@Table(name="classes")
public class ClassEntity {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)//you dont have provide an id data base auto create the primary key
    private long id;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;
    private String grade;
    private String teacher;
    private double fee;

    public ClassEntity(){}//default constructor
    //for hibernate to know how to buld the object

//Id
public Long getId(){
    return id;
}
public void setId(Long id){
    this.id=id;
}

//subject
public Subject getSubject(){
     return subject;
}
public void setSubject(Subject subject){
    this.subject=subject;
}

//Teacher
public String getTeacher(){
    return teacher;
}
public void setTeacher(String teacher){
    this.teacher=teacher;
}

//Fee
public double getFee(){
    return fee;
}
public void setFee(double fee){
    this.fee=fee;
}

//grade
public String getGrade(){
    return grade;
}
public void setGrade(String grade){
    this.grade=grade;
}

}
