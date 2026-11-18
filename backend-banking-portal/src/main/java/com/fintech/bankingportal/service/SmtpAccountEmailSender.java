package com.fintech.bankingportal.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
public class SmtpAccountEmailSender implements AccountEmailSender {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    public SmtpAccountEmailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendPasswordReset(String email, String name, String actionUrl) {
        send(email, "Reset your NeoBank password", "Hello " + name + ",\n\nUse this link to set a new password (valid for 30 minutes):\n" + actionUrl + "\n\nIf you did not request a reset, you can ignore this message.");
    }

    private void send(String email, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(email);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email delivery failed. Please try again later.", ex);
        }
    }
}
