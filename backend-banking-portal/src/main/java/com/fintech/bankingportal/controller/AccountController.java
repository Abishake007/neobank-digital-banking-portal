package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.service.AccountService;
import com.fintech.bankingportal.repository.SavingsGoalRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final SavingsGoalRepository savingsGoalRepository;

    public AccountController(AccountService accountService, SavingsGoalRepository savingsGoalRepository) {
        this.accountService = accountService;
        this.savingsGoalRepository = savingsGoalRepository;
    }

    @GetMapping("/my")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getMyAccount(Authentication authentication) {
        Account account = accountService.getAccountByUserEmail(authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("accountHolderName", account.getUser().getName());
        response.put("accountNumber", account.getAccountNumber());

        // Total Money (The ₹82,000)
        response.put("balance", account.getBalance());

        // Money in Pockets (The ₹12,000)
        response.put("lockedBalance", account.getLockedBalance());
        BigDecimal pocketLocked = savingsGoalRepository.findByAccountId(account.getId()).stream()
                .map(goal -> goal.getSavedAmount() == null ? BigDecimal.ZERO : goal.getSavedAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLocked = account.getLockedBalance() == null ? BigDecimal.ZERO : account.getLockedBalance();
        // The account's locked balance is the source of truth. This also includes
        // investments that predate the investment records used for the breakdown.
        BigDecimal investmentLocked = totalLocked.subtract(pocketLocked).max(BigDecimal.ZERO);
        response.put("pocketLockedBalance", pocketLocked);
        response.put("investmentLockedBalance", investmentLocked);

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
