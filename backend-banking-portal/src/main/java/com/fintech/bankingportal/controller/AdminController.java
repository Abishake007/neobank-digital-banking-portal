package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.dto.AdminUserDTO;
import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.repository.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAllAdminUsers();
    }

}
