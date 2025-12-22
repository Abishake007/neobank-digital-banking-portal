package com.fintech.bankingportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data   // ✅ Generates getters & setters automatically
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer"})
    private Account fromAccount;

    @ManyToOne
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer"})
    private Account toAccount;


    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String status;


    private LocalDateTime createdAt;

}
