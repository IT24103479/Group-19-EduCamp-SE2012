package com.example.Edu_Camp.models;

import jakarta.persistence.*;

@Entity
@Table(name = "teachers")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Name can be optional
    @Column
    private String name;

    // Email unique but optional
    @Column(unique = true)
    private String email;

    private String subject;
    private String phone;
    private String b_day;
    private String qualification;
    private String j_date;


    // ✅ New field for teacher image (store URL or base64 string)
    @Column(length = 1000) // optional: increase column size for longer URLs/base64
    private String image;

    public Teacher() {}

    public Teacher(String name, String email, String subject, String phone,
                   String qualification, String b_day, String j_date, String image) {
        this.name = name;
        this.subject = subject;
        this.email = email;
        this.phone = phone;
        this.b_day = b_day;
        this.qualification = qualification;
        this.j_date = j_date;
        this.image = image;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getB_day() { return b_day; }
    public void setB_day(String b_day) { this.b_day = b_day; }

    public String getJ_date() { return j_date; }
    public void setJ_date(String j_date) { this.j_date = j_date; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
