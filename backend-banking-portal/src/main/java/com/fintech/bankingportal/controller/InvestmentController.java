package com.fintech.bankingportal.controller;

import com.fintech.bankingportal.dto.CreateInvestmentRequest;
import com.fintech.bankingportal.dto.InvestmentView;
import com.fintech.bankingportal.service.InvestmentService;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
@PreAuthorize("isAuthenticated()")
public class InvestmentController {
    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    @GetMapping
    public List<InvestmentView> list(Authentication auth) {
        return investmentService.list(auth.getName());
    }

    @PostMapping
    public InvestmentView create(@RequestBody CreateInvestmentRequest request, Authentication auth) {
        return investmentService.create(auth.getName(), request);
    }

    @PostMapping("/{id}/installment")
    public InvestmentView installment(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        return investmentService.payInstallment(auth.getName(), id, payload.get("password"));
    }

    @PostMapping("/{id}/mature")
    public InvestmentView mature(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth) {
        return investmentService.mature(auth.getName(), id, payload.get("password"));
    }
}
