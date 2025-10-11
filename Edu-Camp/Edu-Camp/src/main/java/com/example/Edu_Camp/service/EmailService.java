package com.example.Edu_Camp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTeacherLoginLink(String email, String temporaryPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your Teacher Account Login Details");
        message.setText(
                "Welcome to EduCamp!\n\n" +
                        "Your account has been created successfully.\n\n" +
                        "Login Details:\n" +
                        "Email: " + email + "\n" +
                        "Temporary Password: " + temporaryPassword + "\n\n" +
                        "Please login and change your password immediately.\n\n" +
                        "Best regards,\n" +
                        "EduCamp Team"
        );

        mailSender.send(message);
    }
}
