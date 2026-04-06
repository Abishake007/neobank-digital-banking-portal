package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.dto.TransferRequest;
import com.fintech.bankingportal.entity.Transaction;
import com.fintech.bankingportal.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.fintech.bankingportal.service.AuthService; // ✅ Add this line

import java.util.List;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final AuthService authService;

    public TransactionController(TransactionService transactionService, AuthService authService) {
        this.transactionService = transactionService;
        this.authService = authService;
    }


    @PostMapping("/transfer")
    public void transferMoney(
            @RequestBody TransferRequest request,
            Authentication authentication
    ) {
        transactionService.transferMoney(
                authentication.getName(),
                request.getToAccountNumber(),
                request.getAmount(),
                request.getCategory()
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

    @GetMapping("/spending-stats")
    public java.util.Map<String, BigDecimal> getSpendingStats(Authentication authentication) {
        // This calls the service method we defined to aggregate the SQL data
        return transactionService.getSpendingStats(authentication.getName());
    }

    // ✅ Secure Add Funds Endpoint
    @PostMapping("/add-funds")
    public ResponseEntity<?> addFunds(@RequestBody Map<String, Object> payload, Authentication auth) {
        String email = auth.getName();
        String password = (String) payload.get("password");

        // Handle potential parsing issues for BigDecimal
        BigDecimal amount = new BigDecimal(payload.get("amount").toString());
        String vpa = (String) payload.get("vpa");

        // 1. Verify Password via the injected AuthService
        boolean isPasswordValid = authService.verifyPassword(email, password);

        if (!isPasswordValid) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", "Incorrect password. Security check failed."));
        }

        // 2. If valid, proceed with the top-up logic
        transactionService.addFundsViaUPI(email, amount, vpa);
        return ResponseEntity.ok(Map.of("message", "Successfully added funds!"));
    }
}