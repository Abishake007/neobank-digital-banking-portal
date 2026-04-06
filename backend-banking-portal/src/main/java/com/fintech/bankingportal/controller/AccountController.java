package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyAccount(Authentication authentication) {
        Account account = accountService.getAccountByUserEmail(authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("accountNumber", account.getAccountNumber());

        // Total Money (The ₹82,000)
        response.put("balance", account.getBalance());

        // Money in Pockets (The ₹12,000)
        response.put("lockedBalance", account.getLockedBalance());

        // Spendable amount (Calculated: ₹70,000)
        response.put("availableBalance", account.getAvailableBalance());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/balance")
    public BigDecimal getMyBalance(Authentication authentication) {
        // Usually, for a "Check Balance" feature, you want to show Available Balance
        return accountService
                .getAccountByUserEmail(authentication.getName())
                .getAvailableBalance();
    }
}