package com.fintech.bankingportal.dto;

import java.util.List;

public record AdminUserDetailsDTO(
        Long id,
        String name,
        String email,
        String role,
        boolean enabled,
        List<AdminAccountDTO> accounts,
        List<AdminTransactionDTO> transactions
) {}
