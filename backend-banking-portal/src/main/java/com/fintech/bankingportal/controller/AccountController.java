package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.repository.AccountRepository;
import com.fintech.bankingportal.service.AccountService;
import org.springframework.security.core.Authentication;   // ✅ CORRECT IMPORT
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // ✅ Dynamic balance (logged-in user)
    @GetMapping("/my")
    public Account getMyAccount(Authentication authentication) {
        return accountService.getAccountByUserEmail(authentication.getName());
    }

    // ✅ Balance only
    @GetMapping("/balance")
    public BigDecimal getMyBalance(Authentication authentication) {
        return accountService
                .getAccountByUserEmail(authentication.getName())
                .getBalance();
    }
}
