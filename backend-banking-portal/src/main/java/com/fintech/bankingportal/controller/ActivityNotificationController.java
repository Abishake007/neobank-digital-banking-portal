package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.dto.ActivityNotificationView;
import com.fintech.bankingportal.service.ActivityNotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class ActivityNotificationController {
    private final ActivityNotificationService notificationService;

    public ActivityNotificationController(ActivityNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<ActivityNotificationView> list(Authentication auth) {
        return notificationService.list(auth.getName());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication auth) {
        return Map.of("count", notificationService.unreadCount(auth.getName()));
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable Long id, Authentication auth) {
        notificationService.markRead(auth.getName(), id);
    }

    @PostMapping("/read-all")
    public void markAllRead(Authentication auth) {
        notificationService.markAllRead(auth.getName());
    }
}
