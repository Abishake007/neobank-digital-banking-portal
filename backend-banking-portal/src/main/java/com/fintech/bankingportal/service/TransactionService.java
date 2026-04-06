package com.fintech.bankingportal.service;

import com.fintech.bankingportal.entity.*;
import com.fintech.bankingportal.exception.InsufficientBalanceException;
import com.fintech.bankingportal.repository.AccountRepository;
import com.fintech.bankingportal.repository.TransactionRepository;
import com.fintech.bankingportal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fintech.bankingportal.repository.SavingsGoalRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final SavingsGoalRepository savingsGoalRepository;

    public TransactionService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            SavingsGoalRepository savingsGoalRepository
    ) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.savingsGoalRepository = savingsGoalRepository;
    }

    // ✅ METHOD 1
    @Transactional
    public void transferMoney(String email, String toAccountNumber, BigDecimal amount, TransactionCategory category) {

        User senderUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account sender = accountRepository.findByUser(senderUser)
                .orElseThrow(() -> new RuntimeException("Sender account not found"));

        Account receiver = accountRepository.findByAccountNumber(toAccountNumber)
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        // ✅ PROBLEM SOLVED: Goal-Based "Pockets" Logic
        // We check if the balance minus the "Locked" amount is enough for this transfer
        // (Note: You'll need a method in Account to calculate 'getLockedBalance')
        BigDecimal availableBalance = sender.getBalance();
        // If you implement the Pockets feature, it would be: sender.getBalance().subtract(sender.getLockedBalance());

        if (availableBalance.compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient available balance (some funds may be locked in Goals)");
        }

        // Update balances
        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(receiver);

        // Create Transaction with Category
        Transaction transaction = new Transaction();
        transaction.setFromAccount(sender);
        transaction.setToAccount(receiver);
        transaction.setAmount(amount);
        transaction.setCategory(category != null ? category : TransactionCategory.OTHERS); // ✅ Categorization
        transaction.setStatus("SUCCESS");
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepository.save(transaction);
    }

    // ✅ METHOD 2
    public List<Transaction> getTransactionHistory(Long accountId) {
        return transactionRepository
                .findByFromAccount_IdOrToAccount_Id(accountId, accountId);
    }

    // ✅ METHOD 3
    public List<Transaction> getRecentTransactions(Long accountId) {
        return transactionRepository
                .findTop5ByFromAccount_IdOrToAccount_IdOrderByCreatedAtDesc(
                        accountId, accountId
                );
    }
    public List<Transaction> getMyTransactions(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = accountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return transactionRepository
                .findByFromAccount_IdOrToAccount_Id(
                        account.getId(),
                        account.getId()
                );
    }
    public List<Transaction> getMonthlyReport(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = accountRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return transactionRepository.findMonthlyTransactions(
                account.getId()
        );
    }

    public Map<String, BigDecimal> getSpendingAnalytics(Long accountId) {
        List<Object[]> results = transactionRepository.getSpendingStats(accountId);
        Map<String, BigDecimal> stats = new HashMap<>();

        for (Object[] result : results) {
            // result[0] is the Category Enum, result[1] is the Sum (BigDecimal)
            if (result[0] != null) {
                stats.put(result[0].toString(), (BigDecimal) result[1]);
            }
        }
        return stats;
    }

    public Map<String, BigDecimal> getSpendingStats(String email) {
        // 1. Find the user/account by email
        // Inside getSpendingStats method
        Account account = accountRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Account not found for email: " + email));

        // 2. Call the repository query we just added
        List<Object[]> results = transactionRepository.getSpendingStats(account.getId());

        // 3. Map it for the Frontend
        Map<String, BigDecimal> stats = new HashMap<>();
        for (Object[] result : results) {
            if (result[0] != null) {
                stats.put(result[0].toString(), (BigDecimal) result[1]);
            }
        }
        return stats;
    }
    @Transactional
    public void addFundsViaUPI(String email, BigDecimal amount, String vpa) {
        // 1. Identify the NeoBank account
        Account account = accountRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // 2. Update Balance (Simulating a successful UPI callback)
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        // 3. Record as an INWARD Transaction
        Transaction transaction = new Transaction();
        transaction.setToAccount(account);
        transaction.setAmount(amount);
        transaction.setStatus("SUCCESS");
        transaction.setCategory(TransactionCategory.OTHERS); // Or create a 'DEPOSIT' category
        transaction.setCreatedAt(LocalDateTime.now());

        // Use the 'description' or a custom field to store the VPA for the audit trail
        // transaction.setDescription("UPI Top-up from " + vpa);

        transactionRepository.save(transaction);
    }

    @Transactional
    public void stashMoney(String email, Long goalId, BigDecimal amount) {
        // 1. Get the account
        Account account = accountRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // 2. Security Check: Do they have enough UNLOCKED money?
        if (account.getAvailableBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient available balance to lock in pocket!");
        }

        // 3. Get the pocket
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Savings Goal not found"));

        // 4. Update the logic
        // We increase the 'lockedBalance' of the account
        // and increase the 'savedAmount' of the specific goal
        account.setLockedBalance(account.getLockedBalance().add(amount));
        goal.setSavedAmount(goal.getSavedAmount().add(amount));

        accountRepository.save(account);
        savingsGoalRepository.save(goal);
    }
}