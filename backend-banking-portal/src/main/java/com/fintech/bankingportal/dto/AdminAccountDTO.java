package com.fintech.bankingportal.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminAccountDTO(
        Long id,
        String accountNumber,
        String accountType,
        BigDecimal balance,
        BigDecimal lockedBalance,
        BigDecimal availableBalance,
        LocalDateTime createdAt
) {}
