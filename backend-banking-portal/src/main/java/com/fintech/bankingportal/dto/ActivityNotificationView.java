package com.fintech.bankingportal.dto;

import java.time.LocalDateTime;

public record ActivityNotificationView(
        Long id,
        String title,
        String message,
        String type,
        LocalDateTime createdAt,
        boolean read
) {}
