package com.fintech.bankingportal.service;

import com.fintech.bankingportal.entity.EmailActionToken;
import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.repository.EmailActionTokenRepository;
import com.fintech.bankingportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;

@Service
public class AccountActionService {
    private static final String RESET_PASSWORD = "RESET_PASSWORD";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final EmailActionTokenRepository tokenRepository;
    private final AccountEmailSender emailSender;
    private final PasswordEncoder passwordEncoder;
    private final String frontendBaseUrl;

    public AccountActionService(UserRepository userRepository,
                                EmailActionTokenRepository tokenRepository,
                                AccountEmailSender emailSender,
                                PasswordEncoder passwordEncoder,
                                @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.emailSender = emailSender;
        this.passwordEncoder = passwordEncoder;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public Map<String, String> requestPasswordReset(String email) {
        userRepository.findByEmail(normalize(email))
                .ifPresent(user -> issue(user, RESET_PASSWORD));
        return Map.of("message", "If a verified account exists for that email, a reset link has been sent.");
    }

    @Transactional
    public Map<String, String> resetPassword(String rawToken, String newPassword) {
        EmailActionToken token = findValidToken(rawToken, RESET_PASSWORD);
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        token.setUsedAt(LocalDateTime.now());
        tokenRepository.save(token);
        return Map.of("message", "Password updated. You can now sign in.");
    }

    private void issue(User user, String purpose) {
        tokenRepository.deleteAllByUser_IdAndPurpose(user.getId(), purpose);
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        EmailActionToken token = new EmailActionToken();
        token.setUser(user);
        token.setPurpose(purpose);
        token.setTokenHash(hash(raw));
        token.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(token);

        String route = "/reset-password";
        String url = UriComponentsBuilder.fromUriString(frontendBaseUrl)
                .path(route)
                .queryParam("token", raw)
                .build().toUriString();
        emailSender.sendPasswordReset(user.getEmail(), user.getName(), url);
    }

    private EmailActionToken findValidToken(String raw, String purpose) {
        if (raw == null || raw.isBlank()) throw invalidToken();
        EmailActionToken token = tokenRepository.findByTokenHashAndPurposeAndUsedAtIsNull(hash(raw), purpose)
                .orElseThrow(this::invalidToken);
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) throw invalidToken();
        return token;
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not process the request");
        }
    }

    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "This link is invalid or has expired. Request a new one.");
    }
}
