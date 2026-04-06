package com.fintech.bankingportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class BankingPortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(BankingPortalApplication.class, args);

       // BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
       // String hash = encoder.encode("1234");
       // System.out.println("BCrypt Hash: " + hash);

    }
}
