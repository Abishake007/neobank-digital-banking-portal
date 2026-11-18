package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.dto.RegisterRequest;
import com.fintech.bankingportal.dto.EmailRequest;
import com.fintech.bankingportal.dto.TokenPasswordRequest;
import com.fintech.bankingportal.repository.UserRepository;
import com.fintech.bankingportal.security.JwtUtil;
import com.fintech.bankingportal.service.AccountService;
import com.fintech.bankingportal.service.AccountActionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AccountService accountService;
    private final AccountActionService accountActionService;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtUtil jwtUtil,
            PasswordEncoder passwordEncoder,
            AccountService accountService,
            AccountActionService accountActionService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.accountService = accountService;
        this.accountActionService = accountActionService;
    }

    @PostMapping("/register")
    @Transactional
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user = userRepository.save(user);

        Account account = accountService.createAccount(user, "SAVINGS");
        Map<String, String> response = new HashMap<>();
        response.put("message", "Account created successfully");
        response.put("accountNumber", account.getAccountNumber());
        return response;
    }

    @PostMapping("/password-reset/request")
    public Map<String, String> requestPasswordReset(@Valid @RequestBody EmailRequest request) {
        return accountActionService.requestPasswordReset(request.email());
    }

    @PostMapping("/password-reset/complete")
    public Map<String, String> resetPassword(@Valid @RequestBody TokenPasswordRequest request) {
        return accountActionService.resetPassword(request.token(), request.password());
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken =
                jwtUtil.generateAccessToken(user.getEmail(), user.getRole());

        String refreshToken =
                jwtUtil.generateRefreshToken(user.getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);

        return response;
    }
}
