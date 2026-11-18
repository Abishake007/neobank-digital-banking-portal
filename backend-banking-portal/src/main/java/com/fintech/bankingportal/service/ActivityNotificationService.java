package com.fintech.bankingportal.service;

import com.fintech.bankingportal.dto.ActivityNotificationView;
import com.fintech.bankingportal.entity.ActivityNotification;
import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.repository.ActivityNotificationRepository;
import com.fintech.bankingportal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityNotificationService {
    private final ActivityNotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public ActivityNotificationService(ActivityNotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void notify(User user, String title, String message, String type) {
        ActivityNotification notification = new ActivityNotification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<ActivityNotificationView> list(String email) {
        User user = findUser(email);
        return notificationRepository.findTop20ByUser_IdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toView).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(String email) {
        return notificationRepository.countByUser_IdAndReadAtIsNull(findUser(email).getId());
    }

    @Transactional
    public void markRead(String email, Long id) {
        User user = findUser(email);
        ActivityNotification notification = notificationRepository.findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (notification.getReadAt() == null) {
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllRead(String email) {
        List<ActivityNotification> unread = notificationRepository.findByUser_IdAndReadAtIsNull(findUser(email).getId());
        LocalDateTime now = LocalDateTime.now();
        unread.forEach(notification -> notification.setReadAt(now));
        notificationRepository.saveAll(unread);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private ActivityNotificationView toView(ActivityNotification notification) {
        return new ActivityNotificationView(notification.getId(), notification.getTitle(), notification.getMessage(),
                notification.getType(), notification.getCreatedAt(), notification.getReadAt() != null);
    }
}
