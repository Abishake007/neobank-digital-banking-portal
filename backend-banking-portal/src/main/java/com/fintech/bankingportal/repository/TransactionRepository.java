package com.fintech.bankingportal.repository;

import com.fintech.bankingportal.dto.MonthlyReportView;
import com.fintech.bankingportal.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByFromAccount_IdOrToAccount_Id(
            Long fromAccountId,
            Long toAccountId
    );

    List<Transaction> findTop5ByFromAccount_IdOrToAccount_IdOrderByCreatedAtDesc(
            Long fromAccountId,
            Long toAccountId
    );

    @Query("""
        SELECT SUM(t.amount)
        FROM Transaction t
        WHERE t.fromAccount.id = :accountId
    """)
    BigDecimal sumSentAmount(@Param("accountId") Long accountId);

    // ✅ Total money RECEIVED by account
    @Query("""
        SELECT SUM(t.amount)
        FROM Transaction t
        WHERE t.toAccount.id = :accountId
    """)
    BigDecimal sumReceivedAmount(@Param("accountId") Long accountId);

    @Query(value = """
    SELECT 
      DATE_FORMAT(t.created_at, '%Y-%m') AS month,
      SUM(CASE WHEN t.from_account_id = :accountId THEN t.amount ELSE 0 END) AS totalSent,
      SUM(CASE WHEN t.to_account_id = :accountId THEN t.amount ELSE 0 END) AS totalReceived
    FROM transactions t
    WHERE t.from_account_id = :accountId OR t.to_account_id = :accountId
    GROUP BY DATE_FORMAT(t.created_at, '%Y-%m')
    ORDER BY month DESC
""", nativeQuery = true)
    List<MonthlyReportView> getMonthlyReport(@Param("accountId") Long accountId);

    @Query("""
    SELECT t FROM Transaction t
    WHERE (t.fromAccount.id = :accountId OR t.toAccount.id = :accountId)
      AND MONTH(t.createdAt) = MONTH(CURRENT_DATE)
      AND YEAR(t.createdAt) = YEAR(CURRENT_DATE)
""")
    List<Transaction> findMonthlyTransactions(@Param("accountId") Long accountId);

}
