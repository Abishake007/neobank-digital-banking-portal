package com.fintech.bankingportal.service;

import com.fintech.bankingportal.dto.CreateInvestmentRequest;
import com.fintech.bankingportal.dto.InvestmentView;
import com.fintech.bankingportal.entity.Account;
import com.fintech.bankingportal.entity.Investment;
import com.fintech.bankingportal.entity.User;
import com.fintech.bankingportal.repository.AccountRepository;
import com.fintech.bankingportal.repository.InvestmentRepository;
import com.fintech.bankingportal.repository.UserRepository;
import com.fintech.bankingportal.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class InvestmentService {
    private final InvestmentRepository investmentRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final ActivityNotificationService notificationService;

    public InvestmentService(InvestmentRepository investmentRepository, AccountRepository accountRepository,
                             UserRepository userRepository, AuthService authService,
                             ActivityNotificationService notificationService) {
        this.investmentRepository = investmentRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.authService = authService;
        this.notificationService = notificationService;
    }

    public List<InvestmentView> list(String email) {
        Account account = account(email);
        return investmentRepository.findByAccount_IdOrderByCreatedAtDesc(account.getId()).stream()
                .map(this::view).toList();
    }

    @Transactional
    public InvestmentView create(String email, CreateInvestmentRequest request) {
        if (!Boolean.TRUE.equals(request.acceptedTerms()) || !Boolean.TRUE.equals(request.acknowledgedSimulation())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Accept the terms and acknowledge this simulated product to continue");
        }
        verifyPassword(email, request.password());
        String type = request.productType() == null ? "" : request.productType().toUpperCase();
        int months = request.termMonths() == null ? 0 : request.termMonths();
        BigDecimal amount = request.amount();
        BigDecimal rate = rate(type, months);
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0 || amount.scale() > 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid amount with up to two decimals");
        }
        if ("FD".equals(type) && amount.compareTo(new BigDecimal("1000")) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "FD minimum deposit is Rs 1,000");
        }
        if ("RD".equals(type) && amount.compareTo(new BigDecimal("500")) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RD monthly installment minimum is Rs 500");
        }
        Account account = account(email);
        int initialLockCount = "RD".equals(type) ? 1 : 1;
        BigDecimal lockedAmount = amount.multiply(BigDecimal.valueOf(initialLockCount));
        if (account.getAvailableBalance().compareTo(lockedAmount) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough available balance for this investment");
        }
        BigDecimal currentLocked = account.getLockedBalance() == null ? BigDecimal.ZERO : account.getLockedBalance();
        account.setLockedBalance(currentLocked.add(lockedAmount));
        accountRepository.save(account);

        Investment investment = new Investment();
        investment.setAccount(account);
        investment.setProductType(type);
        investment.setAmount(amount.setScale(2, RoundingMode.HALF_UP));
        investment.setAnnualRate(rate);
        investment.setTermMonths(months);
        investment.setPaidInstallments(1);
        investment.setStartDate(LocalDate.now());
        investment.setMaturityDate(LocalDate.now().plusMonths(months));
        investment.setTermsAccepted(true);
        investment.setSimulationAcknowledged(true);
        investment.setTermsAcceptedAt(LocalDateTime.now());
        Investment saved = investmentRepository.save(investment);
        notificationService.notify(account.getUser(), "Investment opened",
                type + " opened with a first contribution of ₹" + amount.toPlainString() + ".", "INVESTMENT");
        return view(saved);
    }

    @Transactional
    public InvestmentView payInstallment(String email, Long id, String password) {
        verifyPassword(email, password);
        Account account = account(email);
        Investment investment = investmentRepository.findByIdAndAccount_Id(id, account.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment not found"));
        if (!"RD".equals(investment.getProductType()) || !"ACTIVE".equals(investment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This RD cannot accept installments");
        }
        if (investment.getPaidInstallments() >= investment.getTermMonths()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All installments have been paid");
        }
        if (!YearMonth.from(LocalDate.now()).isAfter(YearMonth.from(investment.getStartDate().plusMonths(investment.getPaidInstallments() - 1L)))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Your next installment is available next month");
        }
        if (account.getAvailableBalance().compareTo(investment.getAmount()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough available balance for this installment");
        }
        BigDecimal currentLocked = account.getLockedBalance() == null ? BigDecimal.ZERO : account.getLockedBalance();
        account.setLockedBalance(currentLocked.add(investment.getAmount()));
        investment.setPaidInstallments(investment.getPaidInstallments() + 1);
        accountRepository.save(account);
        Investment saved = investmentRepository.save(investment);
        notificationService.notify(account.getUser(), "RD installment paid",
                "Your recurring deposit installment was recorded.", "INVESTMENT");
        return view(saved);
    }

    @Transactional
    public InvestmentView mature(String email, Long id, String password) {
        verifyPassword(email, password);
        Account account = account(email);
        Investment investment = investmentRepository.findByIdAndAccount_Id(id, account.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Investment not found"));
        if (!"ACTIVE".equals(investment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This investment has already matured");
        }
        if (LocalDate.now().isBefore(investment.getMaturityDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This investment has not reached its maturity date");
        }

        BigDecimal principal = investment.getAmount().multiply(BigDecimal.valueOf("RD".equals(investment.getProductType())
                ? investment.getPaidInstallments() : 1));
        BigDecimal payout = "FD".equals(investment.getProductType())
                ? compound(principal, investment.getAnnualRate(), investment.getTermMonths())
                : compoundRecurring(investment.getAmount(), investment.getAnnualRate(), investment.getPaidInstallments());
        BigDecimal currentLocked = account.getLockedBalance() == null ? BigDecimal.ZERO : account.getLockedBalance();
        account.setLockedBalance(currentLocked.subtract(principal).max(BigDecimal.ZERO));
        account.setBalance(account.getBalance().add(payout.subtract(principal).max(BigDecimal.ZERO)));
        investment.setStatus("MATURED");
        accountRepository.save(account);
        Investment saved = investmentRepository.save(investment);
        notificationService.notify(account.getUser(), "Investment matured",
                "Your " + investment.getProductType() + " matured and its funds are now available in your account.", "INVESTMENT");
        return view(saved);
    }

    private Account account(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return accountRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
    }

    private void verifyPassword(String email, String password) {
        if (password == null || password.isBlank() || !authService.verifyPassword(email, password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect password. Payment was not processed.");
        }
    }

    private BigDecimal rate(String type, int months) {
        if ("FD".equals(type) && List.of(3, 6, 12, 24).contains(months)) {
            return switch (months) {
                case 3 -> new BigDecimal("4.00");
                case 6 -> new BigDecimal("4.50");
                case 12 -> new BigDecimal("5.50");
                default -> new BigDecimal("6.00");
            };
        }
        if ("RD".equals(type) && List.of(6, 12, 24).contains(months)) {
            return switch (months) {
                case 6 -> new BigDecimal("4.50");
                case 12 -> new BigDecimal("5.50");
                default -> new BigDecimal("6.00");
            };
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a supported investment term");
    }

    private InvestmentView view(Investment investment) {
        LocalDate asOfDate = LocalDate.now().isAfter(investment.getMaturityDate())
                ? investment.getMaturityDate() : LocalDate.now();
        BigDecimal currentValue;
        if ("FD".equals(investment.getProductType())) {
            int elapsedMonths = (int) Math.max(0, ChronoUnit.MONTHS.between(investment.getStartDate(), asOfDate));
            currentValue = compound(investment.getAmount(), investment.getAnnualRate(), elapsedMonths);
        } else {
            currentValue = recurringCurrentValue(investment, asOfDate);
        }
        BigDecimal estimated = "FD".equals(investment.getProductType())
                ? compound(investment.getAmount(), investment.getAnnualRate(), investment.getTermMonths())
                : compoundRecurring(investment.getAmount(), investment.getAnnualRate(), investment.getTermMonths());
        return new InvestmentView(investment.getId(), investment.getProductType(), investment.getAmount(),
                investment.getAnnualRate(), investment.getTermMonths(), investment.getPaidInstallments(),
                investment.getStartDate(), investment.getMaturityDate(), currentValue, estimated, investment.getStatus());
    }

    private BigDecimal recurringCurrentValue(Investment investment, LocalDate asOfDate) {
        double monthlyRate = investment.getAnnualRate().doubleValue() / 1200d;
        double currentValue = 0;
        for (int installment = 0; installment < investment.getPaidInstallments(); installment++) {
            LocalDate assumedDepositDate = investment.getStartDate().plusMonths(installment);
            long elapsedMonths = Math.max(0, ChronoUnit.MONTHS.between(assumedDepositDate, asOfDate));
            currentValue += investment.getAmount().doubleValue() * Math.pow(1 + monthlyRate, elapsedMonths);
        }
        return BigDecimal.valueOf(currentValue).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal compound(BigDecimal principal, BigDecimal rate, int months) {
        double monthlyRate = rate.doubleValue() / 1200d;
        return BigDecimal.valueOf(principal.doubleValue() * Math.pow(1 + monthlyRate, months))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal compoundRecurring(BigDecimal installment, BigDecimal rate, int months) {
        double monthlyRate = rate.doubleValue() / 1200d;
        double amount = monthlyRate == 0 ? installment.doubleValue() * months
                : installment.doubleValue() * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
        return BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP);
    }
}
