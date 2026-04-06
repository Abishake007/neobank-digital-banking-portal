package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.entity.SavingsGoal;
import com.fintech.bankingportal.repository.SavingsGoalRepository;
import com.fintech.bankingportal.service.TransactionService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.fintech.bankingportal.service.AccountService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/savings")
@CrossOrigin(origins = "http://localhost:4200")
public class SavingsGoalController {

    private final TransactionService transactionService;
    private final SavingsGoalRepository savingsGoalRepository;
    private final AccountService accountService;

    public SavingsGoalController(TransactionService transactionService, SavingsGoalRepository savingsGoalRepository, AccountService accountService) {
        this.transactionService = transactionService;
        this.savingsGoalRepository = savingsGoalRepository;
        this.accountService = accountService;
    }

    @GetMapping("/my-pockets")
    public ResponseEntity<List<SavingsGoal>> getMyPockets(Authentication auth) {
        // Assuming your account service can find the account by email
        Account account = accountService.getAccountByUserEmail(auth.getName());
        List<SavingsGoal> goals = savingsGoalRepository.findByAccountId(account.getId());
        return ResponseEntity.ok(goals);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createGoal(@RequestBody Map<String, Object> payload, Authentication auth) {
        try {
            // 1. Get the account using your service
            Account account = accountService.getAccountByUserEmail(auth.getName());

            // 2. Create and Save the Goal
            SavingsGoal goal = new SavingsGoal();
            goal.setGoalName((String) payload.get("goalName")); // Matches Angular key
            goal.setTargetAmount(new BigDecimal(payload.get("targetAmount").toString()));
            goal.setSavedAmount(BigDecimal.ZERO);
            goal.setAccount(account); // ✅ THIS links it to the database

            savingsGoalRepository.save(goal);

            // ✅ 3. Return JSON, NOT a String
            return ResponseEntity.ok(Map.of("message", "Goal Created Successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/stash")
    public ResponseEntity<?> stash(@RequestParam Long goalId, @RequestParam BigDecimal amount, Authentication auth) {
        transactionService.stashMoney(auth.getName(), goalId, amount);
        return ResponseEntity.ok("Money Stashed Successfully");
    }

    // Inside SavingsGoalController.java

    @DeleteMapping("/claim/{id}")
    public ResponseEntity<?> claimGoal(@PathVariable Long id) {
        // ✅ Use the service method we will create below
        accountService.releaseSavingsGoalFunds(id);

        return ResponseEntity.ok(Map.of("message", "Funds released and pocket closed!"));
    }
}