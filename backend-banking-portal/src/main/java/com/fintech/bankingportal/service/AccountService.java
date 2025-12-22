package com.fintech.bankingportal.service;

import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.entity.User;

import java.util.List;

public interface AccountService {

    Account createAccount(User user, String accountType);

    Account getAccountByNumber(String accountNumber);

    // ✅ ADD THIS
    Account getAccountByUserEmail(String email);
}
