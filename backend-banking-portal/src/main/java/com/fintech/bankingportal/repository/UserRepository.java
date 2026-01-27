package com.fintech.bankingportal.repository;

import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.dto.AdminUserDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // ✅ ADMIN USER LIST (WITH ENABLED STATUS)
    @Query("""
        SELECT new com.fintech.bankingportal.dto.AdminUserDTO(
            u.id,
            u.name,
            u.email,
            u.role,
            u.enabled
        )
        FROM User u
    """)
    List<AdminUserDTO> findAllAdminUsers();

    // ✅ ENABLE / DISABLE USER
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.enabled = :enabled WHERE u.id = :id")
    void updateUserStatus(Long id, boolean enabled);
}
