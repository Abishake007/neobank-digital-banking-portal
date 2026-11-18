package com.fintech.bankingportal.repository;

import com.fintech.bankingportal.entity.ActivityNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ActivityNotificationRepository extends JpaRepository<ActivityNotification, Long> {
    List<ActivityNotification> findTop20ByUser_IdOrderByCreatedAtDesc(Long userId);
    long countByUser_IdAndReadAtIsNull(Long userId);
    Optional<ActivityNotification> findByIdAndUser_Id(Long id, Long userId);
    List<ActivityNotification> findByUser_IdAndReadAtIsNull(Long userId);
}
