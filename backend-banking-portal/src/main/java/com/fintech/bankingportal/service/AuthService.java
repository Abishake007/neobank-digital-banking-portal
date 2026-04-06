package com.fintech.bankingportal.service;

import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ This is the method the Controller was looking for
    public boolean verifyPassword(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Matches the raw input from the UI with the hashed password in the Database
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }
}