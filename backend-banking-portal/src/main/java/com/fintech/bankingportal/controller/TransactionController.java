package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.dto.TransferRequest;
import com.fintech.bankingportal.entity.Transaction;
import com.fintech.bankingportal.service.TransactionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/transfer")
    public void transferMoney(
            @RequestBody TransferRequest request,
            Authentication authentication
    ) {
        transactionService.transferMoney(
                authentication.getName(),   // ✅ NOW WORKS
                request.getToAccountId(),
                request.getAmount()
        );
    }





    @GetMapping("/history/{accountId}")
    public List<Transaction> getHistory(@PathVariable Long accountId) {
        return transactionService.getTransactionHistory(accountId);
    }

    @GetMapping("/recent/{accountId}")
    public List<Transaction> getRecent(@PathVariable Long accountId) {
        return transactionService.getRecentTransactions(accountId);
    }

    @GetMapping("/my")
    public List<Transaction> getMyTransactions(Authentication authentication) {
        return transactionService.getMyTransactions(authentication.getName());
    }
    @GetMapping("/monthly")
    public List<Transaction> getMonthlyReport(Authentication authentication) {
        return transactionService.getMonthlyReport(authentication.getName());
    }


}