package com.example.Edu_Camp.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendTeacherLoginLink(String email, String tempPassword) {
        // Minimal implementation: in production, integrate with SMTP or external provider.
        logger.info("sendTeacherLoginLink -> To: {} | Temporary password: {}", email, tempPassword);
    }

    // Optional helper for other email types
    public void sendGenericEmail(String to, String subject, String body) {
        logger.info("sendGenericEmail -> To: {} | Subject: {} | Body: {}", to, subject, body);
    }
}
