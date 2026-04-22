package com.pocketcontrol.controller;

import com.pocketcontrol.model.Budget;
import com.pocketcontrol.repository.BudgetRepository;
import com.pocketcontrol.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetController(BudgetRepository budgetRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
    }

    private Long getUserId(String token) {
        return userRepository.findByAuthToken(token)
                .map(u -> u.getId())
                .orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getBudgets(@RequestHeader("Authorization") String auth) {
        String token = auth.replace("Bearer ", "");
        Long userId = getUserId(token);
        if (userId == null) return ResponseEntity.status(401).build();

        LocalDate today = LocalDate.now();
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(
            userId, today.getMonthValue(), today.getYear());
        return ResponseEntity.ok(budgets);
    }

    @PostMapping
    public ResponseEntity<?> saveBudget(
            @RequestHeader("Authorization") String auth,
            @RequestBody Map<String, Object> body) {

        String token = auth.replace("Bearer ", "");
        Long userId = getUserId(token);
        if (userId == null) return ResponseEntity.status(401).build();

        String category = (String) body.get("category");
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        LocalDate today = LocalDate.now();

        Budget budget = budgetRepository
            .findByUserIdAndMonthAndYearAndCategory(
                userId, today.getMonthValue(), today.getYear(), category)
            .orElse(new Budget(userId, today.getMonthValue(), today.getYear(), category, amount));

        budget.setAmount(amount);
        budgetRepository.save(budget);

        return ResponseEntity.ok(Map.of("message", "Presupuesto guardado", "category", category, "amount", amount));
    }
}