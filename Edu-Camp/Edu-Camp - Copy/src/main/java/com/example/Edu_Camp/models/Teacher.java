package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "teachers")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String phone;
    private String b_day;
    private String qualification;

    private String j_date;

    @Column(length = 1000)
    private String image;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @PrePersist
    protected void onCreate() {
        if (this.j_date == null || this.j_date.isEmpty()) {
            this.j_date = LocalDate.now().toString();
        }
    }

    public Teacher() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

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
