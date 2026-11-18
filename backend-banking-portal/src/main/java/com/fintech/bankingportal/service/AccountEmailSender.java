package com.fintech.bankingportal.service;

public interface AccountEmailSender {
    void sendPasswordReset(String email, String name, String actionUrl);
}
