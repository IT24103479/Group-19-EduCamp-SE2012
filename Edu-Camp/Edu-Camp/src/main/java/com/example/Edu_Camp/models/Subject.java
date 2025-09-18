package com.example.Edu_Camp.models;

import jakarta.persistence.*;
import java.util.List;


@Entity
@Table(name="subjects")
public class Subject {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
}
