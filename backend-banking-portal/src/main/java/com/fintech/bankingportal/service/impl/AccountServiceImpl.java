package com.fintech.bankingportal.service.impl;

import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.entity.SavingsGoal;
import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.repository.AccountRepository;
import com.fintech.bankingportal.repository.UserRepository; // ✅ REQUIRED
import com.fintech.bankingportal.service.AccountService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import com.fintech.bankingportal.repository.SavingsGoalRepository;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final SavingsGoalRepository savingsGoalRepository;

    public AccountServiceImpl(
            AccountRepository accountRepository,
            UserRepository userRepository,
            SavingsGoalRepository savingsGoalRepository
    ) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.savingsGoalRepository = savingsGoalRepository;
    }

    @Override
    public Account createAccount(User user, String accountType) {
        Account account = new Account();
        account.setUser(user);
        account.setAccountType(accountType);
        account.setBalance(BigDecimal.ZERO);
        account = accountRepository.save(account);
        account.setAccountNumber("ACC" + (1000 + account.getId()));
        return accountRepository.save(account);
    }

    @Override
    public Account getAccountByUserEmail(String email) {

        System.out.println("EMAIL FROM JWT = " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));

        System.out.println("USER ID = " + user.getId());

        Account account = accountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("ACCOUNT NOT FOUND"));

        System.out.println("ACCOUNT ID = " + account.getId());
        System.out.println("BALANCE = " + account.getBalance());

        return account;
    }

    @Override
    @Transactional
    public void releaseSavingsGoalFunds(Long goalId) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        Account account = goal.getAccount();
        BigDecimal savedAmount = goal.getSavedAmount();

        // ✅ 3. LOGIC: Unlock the money
        // We subtract from lockedBalance because the money is no longer "stashed"
        if (account.getLockedBalance().compareTo(savedAmount) >= 0) {
            account.setLockedBalance(account.getLockedBalance().subtract(savedAmount));
        }

        // Note: We don't need to add to account.getBalance() because
        // 'balance' usually represents the TOTAL (Spendable + Locked).
        // By reducing lockedBalance, your 'getAvailableBalance()' method
        // in the Entity will automatically show a higher spendable amount!

        // 4. Save and Delete
        accountRepository.save(account);
        savingsGoalRepository.delete(goal);
    }

    @Override
    public Account getAccountByNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
    }

    private String generateAccountNumber() {
        return "AC" + UUID.randomUUID().toString()
                .substring(0, 8)
                .toUpperCase();
    }
}
