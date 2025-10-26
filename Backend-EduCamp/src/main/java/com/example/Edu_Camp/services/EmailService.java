package com.example.Edu_Camp.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "spring.mail.host", matchIfMissing = false)
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTeacherLoginLink(String email, String temporaryPassword) {
        try {
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
        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
            // Don't throw exception - just log and continue
        }
    }
}

