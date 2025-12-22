package com.fintech.bankingportal.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fintech.bankingportal.entity.User;


@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;   // ✅ PRIMARY KEY (MANDATORY)

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String role;
}
