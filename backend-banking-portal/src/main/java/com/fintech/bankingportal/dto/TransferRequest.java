package com.fintech.bankingportal.dto;

import com.fintech.bankingportal.entity.TransactionCategory;

import java.math.BigDecimal;

public class TransferRequest {

    private String toAccountNumber;
    private BigDecimal amount;
    private com.fintech.bankingportal.entity.TransactionCategory category;

    public String getToAccountNumber() {
        return toAccountNumber;
    }

    public void setToAccountNumber(String toAccountNumber) {
        this.toAccountNumber = toAccountNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionCategory getCategory() {
        return category;
    }

    public void setCategory(TransactionCategory category) {
        this.category = category;
    }
}