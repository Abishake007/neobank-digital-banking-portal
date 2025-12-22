package com.fintech.bankingportal.service;

import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.entity.Transaction;
import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.exception.InsufficientBalanceException;
import com.fintech.bankingportal.repository.AccountRepository;
import com.fintech.bankingportal.repository.TransactionRepository;
import com.fintech.bankingportal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;


    // ✅ constructor (MUST be closed properly)
    public TransactionService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    // ✅ METHOD 1
    @Transactional
    public void transferMoney(String email, Long toId, BigDecimal amount) {

        User senderUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account sender = accountRepository.findByUser(senderUser)
                .orElseThrow(() -> new RuntimeException("Sender account not found"));

        Account receiver = accountRepository.findByIdForUpdate(toId)
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException("Insufficient balance");
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(receiver);

        Transaction transaction = new Transaction();
        transaction.setFromAccount(sender);
        transaction.setToAccount(receiver);
        transaction.setAmount(amount);
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


}
