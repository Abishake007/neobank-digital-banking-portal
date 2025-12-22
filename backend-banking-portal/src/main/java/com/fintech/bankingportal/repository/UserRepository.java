package com.fintech.bankingportal.repository;

import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.dto.AdminUserDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    @Query("""
        SELECT new com.fintech.bankingportal.dto.AdminUserDTO(
            u.id,
            u.name,
            u.email,
            u.role
        )
        FROM User u
    """)
    List<AdminUserDTO> findAllAdminUsers();
}
