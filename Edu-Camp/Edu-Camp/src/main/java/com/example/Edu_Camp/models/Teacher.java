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
    private String b_day;
    private String qualification;
    private String j_date;

    public Teacher() {}

    public Teacher(String name,String email,String subject,String phone,String address,String qualification,String b_day, String j_date) {

        this.name = name;
        this.subject = subject;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.b_day = b_day;
        this.qualification = qualification;
        this.b_day = b_day;
        this.j_date = j_date;
    }
    public Long getId () {
        return id;
    }
    public void setId (Long id){
        this.id = id;
    }

    public String getName () {
        return name;
    }
    public void setName (String name){
        this.name = name;
    }

    public String getEmail () {
        return email;
    }
    public void setEmail (String email){
        this.email = email;
    }

    public String getSubject () {
        return subject;
    }
    public void setSubject (String subject){
        this.subject = subject;
    }

    public String getPhone () {
        return phone;
    }
    public void setPhone (String phone){
        this.phone = phone;
    }

    public String getAddress () {
        return address;
    }
    public void setAddress (String address){
        this.address = address;
    }

    public String getQualification () {
        return qualification;
    }
    public void setQualification (String qualification){
        this.qualification = qualification;
    }

    public String getB_day () {
        return b_day;
    }
    public void setB_day (String b_day){
        this.b_day = b_day;
    }

    public String getJ_date () {
        return j_date;
    }
    public void setJ_date (String j_date) {
        this.j_date= j_date;
    }
}