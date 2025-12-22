package com.fintech.bankingportal.dto;

import java.math.BigDecimal;

public interface MonthlyReportView {

    String getMonth();
    BigDecimal getTotalSent();
    BigDecimal getTotalReceived();
}
