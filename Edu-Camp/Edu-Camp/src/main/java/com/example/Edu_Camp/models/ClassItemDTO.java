package com.example.Edu_Camp.models;

import java.util.List;

public class ClassItemDTO {
    public Long class_id;
    public String fee;
    public String grade;
    public String name;
    public String image;
    public String timetable;
    // could be double if you want numeric
    public Long teacher_id;
    public String teacher_name;
    public List<Long> subjectIds;
    public List<String> subjectNames;
}
