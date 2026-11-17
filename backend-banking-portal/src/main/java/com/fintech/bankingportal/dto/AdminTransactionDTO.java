package com.fintech.bankingportal.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminTransactionDTO(
        Long id,
        BigDecimal amount,
        String status,
        String category,
        LocalDateTime createdAt,
        String fromAccountNumber,
        String fromUserName,
        String toAccountNumber,
        String toUserName
) {}
