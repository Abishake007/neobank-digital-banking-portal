package com.fintech.bankingportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TokenPasswordRequest(
        @NotBlank String token,
        @NotBlank @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,72}$",
                message = "Password must be 8-72 characters and include uppercase, lowercase, a number, and a special character") String password
) {}
