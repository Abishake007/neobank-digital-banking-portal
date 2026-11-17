package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.dto.AdminUserDTO;
import com.fintech.bankingportal.dto.AdminAccountDTO;
import com.fintech.bankingportal.dto.AdminTransactionDTO;
import com.fintech.bankingportal.dto.AdminUserDetailsDTO;
import com.fintech.bankingportal.dto.CreateUserRequest;
import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.repository.AccountRepository;
import com.fintech.bankingportal.repository.UserRepository;
import com.fintech.bankingportal.repository.TransactionRepository;
import com.fintech.bankingportal.entity.Transaction;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final TransactionRepository transactionRepository;

    public AdminController(UserRepository userRepository,
                           AccountRepository accountRepository,
                           PasswordEncoder passwordEncoder,
                           TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.transactionRepository = transactionRepository;
    }

    // TEST ENDPOINT (optional, but useful)
    @GetMapping("/test")
    public String testAdmin() {
        return "ADMIN ACCESS OK";
    }

    // VIEW USERS
    @GetMapping("/users")
    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAllAdminUsers();
    }

    @GetMapping("/users/{id}/details")
    public AdminUserDetailsDTO getUserDetails(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        List<Account> accounts = accountRepository.findAllByUser_Id(id);
        List<AdminAccountDTO> accountDetails = accounts.stream()
                .map(account -> new AdminAccountDTO(account.getId(), account.getAccountNumber(),
                        account.getAccountType(), account.getBalance(), account.getLockedBalance(),
                        account.getAvailableBalance(), account.getCreatedAt()))
                .toList();
        List<AdminTransactionDTO> transactions = accounts.stream()
                .flatMap(account -> transactionRepository
                        .findByFromAccount_IdOrToAccount_Id(account.getId(), account.getId()).stream())
                .distinct()
                .sorted(Comparator.comparing(Transaction::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toAdminTransaction)
                .toList();

        return new AdminUserDetailsDTO(user.getId(), user.getName(), user.getEmail(), user.getRole(),
                user.isEnabled(), accountDetails, transactions);
    }

    private AdminTransactionDTO toAdminTransaction(Transaction transaction) {
        Account from = transaction.getFromAccount();
        Account to = transaction.getToAccount();
        return new AdminTransactionDTO(transaction.getId(), transaction.getAmount(), transaction.getStatus(),
                transaction.getCategory() == null ? null : transaction.getCategory().name(),
                transaction.getCreatedAt(), from == null ? null : from.getAccountNumber(),
                from == null || from.getUser() == null ? null : from.getUser().getName(),
                to == null ? null : to.getAccountNumber(),
                to == null || to.getUser() == null ? null : to.getUser().getName());
    }

    // CREATE USER + ACCOUNT
    @PostMapping("/users")
    public String createUser(@RequestBody CreateUserRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "User already exists";
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole()); // USER / ADMIN

        userRepository.save(user);

        Account account = new Account();
        account.setUser(user);
        account.setAccountType("SAVINGS");
        account.setBalance(BigDecimal.ZERO);

        accountRepository.save(account);

        return "User created successfully";
    }

    @PutMapping("/users/{id}/status")
    public void updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled
    ) {
        userRepository.updateUserStatus(id, enabled);
    }

}
