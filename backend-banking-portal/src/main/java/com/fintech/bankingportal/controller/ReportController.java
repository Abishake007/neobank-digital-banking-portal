package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.dto.MonthlyReportView;
import com.fintech.bankingportal.repository.TransactionRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final TransactionRepository transactionRepository;

    public ReportController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/summary/{accountId}")
    public Map<String, Object> getSummary(@PathVariable Long accountId) {

        BigDecimal sent = transactionRepository.sumSentAmount(accountId);
        BigDecimal received = transactionRepository.sumReceivedAmount(accountId);

        Map<String, Object> result = new HashMap<>();
        result.put("totalSent", sent == null ? 0 : sent);
        result.put("totalReceived", received == null ? 0 : received);
        result.put("netChange",
                (received == null ? BigDecimal.ZERO : received)
                        .subtract(sent == null ? BigDecimal.ZERO : sent));

        return result;
    }
    @GetMapping("/monthly/{accountId}")
    public List<MonthlyReportView> getMonthlyReport(@PathVariable Long accountId) {
        return transactionRepository.getMonthlyReport(accountId);
    }


}
