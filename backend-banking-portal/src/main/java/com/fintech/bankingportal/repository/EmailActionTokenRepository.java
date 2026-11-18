package com.fintech.bankingportal.repository;

import com.fintech.bankingportal.entity.EmailActionToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmailActionTokenRepository extends JpaRepository<EmailActionToken, Long> {
    Optional<EmailActionToken> findByTokenHashAndPurposeAndUsedAtIsNull(String tokenHash, String purpose);
    void deleteAllByUser_IdAndPurpose(Long userId, String purpose);
}
