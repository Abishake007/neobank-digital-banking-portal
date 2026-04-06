package com.fintech.bankingportal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
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

    // ✅ Add this to link the Enum
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionCategory category;

    private LocalDateTime createdAt;

    // Optional: Auto-set the timestamp and a default category
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.category == null) {
            this.category = TransactionCategory.OTHERS;
        }
    }
}