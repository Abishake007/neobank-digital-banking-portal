package com.fintech.bankingportal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvestmentView(
        Long id,
        String productType,
        BigDecimal amount,
        BigDecimal annualRate,
        int termMonths,
        int paidInstallments,
        LocalDate startDate,
        LocalDate maturityDate,
        BigDecimal currentValue,
        BigDecimal estimatedMaturityValue,
        String status
) {}
