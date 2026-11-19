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
        WHERE t.fromAccount.id = :accountId AND t.category NOT IN (com.fintech.bankingportal.entity.TransactionCategory.POCKET, com.fintech.bankingportal.entity.TransactionCategory.INVESTMENT)
    """)
    BigDecimal sumSentAmount(@Param("accountId") Long accountId);

    // ✅ Total money RECEIVED by account
    @Query("""
        SELECT SUM(t.amount)
        FROM Transaction t
        WHERE t.toAccount.id = :accountId AND t.category NOT IN (com.fintech.bankingportal.entity.TransactionCategory.POCKET, com.fintech.bankingportal.entity.TransactionCategory.INVESTMENT)
    """)
    BigDecimal sumReceivedAmount(@Param("accountId") Long accountId);

    @Query(value = """
    SELECT 
      DATE_FORMAT(t.created_at, '%Y-%m') AS month,
      SUM(CASE WHEN t.from_account_id = :accountId AND t.category NOT IN ('POCKET', 'INVESTMENT') THEN t.amount ELSE 0 END) AS totalSent,
      SUM(CASE WHEN t.to_account_id = :accountId AND t.category NOT IN ('POCKET', 'INVESTMENT') THEN t.amount ELSE 0 END) AS totalReceived
    FROM transactions t
    WHERE (t.from_account_id = :accountId OR t.to_account_id = :accountId)
      AND t.category NOT IN ('POCKET', 'INVESTMENT')
    GROUP BY DATE_FORMAT(t.created_at, '%Y-%m')
    ORDER BY month DESC
""", nativeQuery = true)
    List<MonthlyReportView> getMonthlyReport(@Param("accountId") Long accountId);

    @Query("""
    SELECT t FROM Transaction t 
    WHERE (t.fromAccount.id = :accountId OR t.toAccount.id = :accountId)
      AND t.category NOT IN (com.fintech.bankingportal.entity.TransactionCategory.POCKET, com.fintech.bankingportal.entity.TransactionCategory.INVESTMENT)
    ORDER BY t.createdAt DESC
""")
List<Transaction> findMonthlyTransactions(@Param("accountId") Long accountId);
    // ✅ Add this to get the Spending Stats for the Chart
    @Query("""
        SELECT t.category, SUM(t.amount) 
        FROM Transaction t 
        WHERE t.fromAccount.id = :accountId AND t.category NOT IN (com.fintech.bankingportal.entity.TransactionCategory.POCKET, com.fintech.bankingportal.entity.TransactionCategory.INVESTMENT)
        GROUP BY t.category
    """)
    List<Object[]> getSpendingStats(@Param("accountId") Long accountId);
}
