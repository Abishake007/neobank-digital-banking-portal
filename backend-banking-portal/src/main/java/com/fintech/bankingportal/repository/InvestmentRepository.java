package com.fintech.bankingportal.repository;

import com.fintech.bankingportal.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByAccount_IdOrderByCreatedAtDesc(Long accountId);
    Optional<Investment> findByIdAndAccount_Id(Long id, Long accountId);
}
