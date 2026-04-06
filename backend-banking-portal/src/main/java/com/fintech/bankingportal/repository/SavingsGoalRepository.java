package com.fintech.bankingportal.repository;

import com.fintech.bankingportal.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
    // Find all pockets belonging to a specific account
    List<SavingsGoal> findByAccountId(Long accountId);
}