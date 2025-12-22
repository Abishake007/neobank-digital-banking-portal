package com.fintech.bankingportal.service.impl;

import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.repository.AccountRepository;
import com.fintech.bankingportal.repository.UserRepository; // ✅ REQUIRED
import com.fintech.bankingportal.service.AccountService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountServiceImpl(
            AccountRepository accountRepository,
            UserRepository userRepository
    ) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Account createAccount(User user, String accountType) {
        Account account = new Account();
        account.setUser(user);
        account.setAccountType(accountType);
        account.setBalance(BigDecimal.ZERO);
        account.setAccountNumber(generateAccountNumber());
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
