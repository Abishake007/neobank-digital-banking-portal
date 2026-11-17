package com.fintech.bankingportal.dto;

import java.math.BigDecimal;

public record CreateInvestmentRequest(String productType, BigDecimal amount, Integer termMonths,
                                      Boolean acceptedTerms, Boolean acknowledgedSimulation, String password) {}
