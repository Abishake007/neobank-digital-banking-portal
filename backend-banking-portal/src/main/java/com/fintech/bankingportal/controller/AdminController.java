package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.dto.AdminUserDTO;
import com.fintech.bankingportal.dto.CreateUserRequest;
import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.repository.AccountRepository;
import com.fintech.bankingportal.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")   // ✅ THIS IS THE KEY
public class AdminController {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository,
                           AccountRepository accountRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ TEST ENDPOINT (optional, but useful)
    @GetMapping("/test")
    public String testAdmin() {
        return "ADMIN ACCESS OK";
    }

    // ✅ VIEW USERS
    @GetMapping("/users")
    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAllAdminUsers();
    }

    // ✅ CREATE USER + ACCOUNT
    @PostMapping("/users")
    public String createUser(@RequestBody CreateUserRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole()); // USER / ADMIN

        userRepository.save(user);

        Account account = new Account();
        account.setUser(user);
        account.setAccountType("SAVINGS");
        account.setBalance(BigDecimal.ZERO);

        accountRepository.save(account);

        return "User created successfully";
    }

    @PutMapping("/users/{id}/status")
    public void updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled
    ) {
        userRepository.updateUserStatus(id, enabled);
    }

}
