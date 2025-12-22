package com.fintech.bankingportal.dto;

public class AdminUserDTO {

    private Long id;
    private String name;
    private String email;
    private String role;

    // 🚨 MUST MATCH QUERY ORDER & TYPES
    public AdminUserDTO(Long id, String name, String email, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
}
