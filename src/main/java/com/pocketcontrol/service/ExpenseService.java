package com.pocketcontrol.service;

import com.pocketcontrol.dto.ExpenseResponse;
import com.pocketcontrol.dto.StatsResponse;
import com.pocketcontrol.model.Budget;
import com.pocketcontrol.model.Expense;
import com.pocketcontrol.repository.BudgetRepository;
import com.pocketcontrol.repository.ExpenseRepository;
import com.pocketcontrol.repository.UserRepository;
import com.pocketcontrol.model.User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private final ClassifierService classifierService;
    private final UserRepository userRepository;

    // Presupuesto mensual por defecto
    private static final BigDecimal DEFAULT_BUDGET = new BigDecimal("500000");

    public ExpenseService(ExpenseRepository expenseRepository,
                         BudgetRepository budgetRepository,
                         ClassifierService classifierService,
                         UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.budgetRepository = budgetRepository;
        this.classifierService = classifierService;
        this.userRepository = userRepository;
    }

    /**
     * Registra un gasto a partir de texto libre y categoría opcional.
     */
    public ExpenseResponse createFromText(Long userId, String text, String explicitCategory) {
        BigDecimal amount = classifierService.extractAmount(text);
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return null; // No se encontró un monto válido
        }

        String description = classifierService.extractDescription(text);
        String category = (explicitCategory != null && !explicitCategory.isEmpty()) ? explicitCategory : classifierService.classify(text);
        String icon = classifierService.getIcon(category);

        Expense expense = new Expense(userId, amount, description, category);
        expense = expenseRepository.save(expense);

        userRepository.findById(userId).ifPresent(u -> {
            u.setStars(u.getStars() + 1);
            userRepository.save(u);
        });

        return new ExpenseResponse(
            expense.getId(), expense.getAmount(), expense.getDescription(),
            expense.getCategory(), icon, expense.getCreatedAt()
        );
    }

    /**
     * Retorna los últimos 2 gastos del usuario.
     */
    public List<ExpenseResponse> getRecentExpenses(Long userId) {
        return expenseRepository.findTop2ByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retorna todos los gastos del mes actual, opcionalmente filtrados por categoría.
     */
    public List<ExpenseResponse> getMonthExpenses(Long userId, String category) {
        LocalDateTime[] range = getCurrentMonthRange();

        List<Expense> expenses;
        if (category != null && !category.isEmpty() && !category.equals("Todas")) {
            expenses = expenseRepository
                .findByUserIdAndCategoryAndCreatedAtBetweenOrderByCreatedAtDesc(
                    userId, category, range[0], range[1]);
        } else {
            expenses = expenseRepository
                .findAllByUserIdAndMonth(userId, range[0], range[1]);
        }

        return expenses.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Elimina un gasto del usuario.
     */
    public boolean deleteExpense(Long userId, Long expenseId) {
        return expenseRepository.findById(expenseId)
            .filter(e -> e.getUserId().equals(userId))
            .map(e -> {
                expenseRepository.delete(e);
                return true;
            })
            .orElse(false);
    }

    /**
     * Genera las estadísticas del mes actual.
     */
    public StatsResponse getStats(Long userId) {
        LocalDateTime[] currentRange = getCurrentMonthRange();
        LocalDateTime[] prevRange = getPreviousMonthRange();
        LocalDate today = LocalDate.now();

        // Totales
        BigDecimal totalMonth = expenseRepository.sumByUserIdAndDateRange(
            userId, currentRange[0], currentRange[1]);
        BigDecimal totalPrevMonth = expenseRepository.sumByUserIdAndDateRange(
            userId, prevRange[0], prevRange[1]);

        // Conteo de transacciones
        long txCount = expenseRepository.countByUserIdAndCreatedAtBetween(
            userId, currentRange[0], currentRange[1]);

        // Promedio por día (días transcurridos del mes)
        int dayOfMonth = today.getDayOfMonth();
        BigDecimal avgPerDay = dayOfMonth > 0
            ? totalMonth.divide(new BigDecimal(dayOfMonth), 0, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        // Presupuesto
        BigDecimal budget = budgetRepository
            .findByUserIdAndMonthAndYearAndCategory(userId, today.getMonthValue(), today.getYear(), "Total")
            .map(Budget::getAmount)
            .orElse(DEFAULT_BUDGET);

        double budgetPercent = budget.compareTo(BigDecimal.ZERO) > 0
            ? totalMonth.divide(budget, 4, RoundingMode.HALF_UP).doubleValue() * 100
            : 0;

        // Por categoría
        List<Object[]> categoryData = expenseRepository.sumByCategoryAndDateRange(
            userId, currentRange[0], currentRange[1]);

        List<StatsResponse.CategoryStat> categories = new ArrayList<>();
        for (Object[] row : categoryData) {
            String cat = (String) row[0];
            BigDecimal catTotal = (BigDecimal) row[1];
            double catPercent = totalMonth.compareTo(BigDecimal.ZERO) > 0
                ? catTotal.divide(totalMonth, 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0;
            categories.add(new StatsResponse.CategoryStat(
                cat, classifierService.getIcon(cat), catTotal, catPercent));
        }

        // Armar respuesta
        StatsResponse stats = new StatsResponse();
        stats.setTotalMonth(totalMonth);
        stats.setTotalPrevMonth(totalPrevMonth);
        stats.setTransactionCount(txCount);
        stats.setAveragePerDay(avgPerDay);
        stats.setBudget(budget);
        stats.setBudgetPercent(budgetPercent);
        stats.setCategories(categories);

        return stats;
    }

    /**
     * Retorna info del balance para la vista Home.
     */
    public Map<String, Object> getHomeData(Long userId) {
        LocalDateTime[] range = getCurrentMonthRange();
        LocalDate today = LocalDate.now();

        BigDecimal totalMonth = expenseRepository.sumByUserIdAndDateRange(
            userId, range[0], range[1]);

        BigDecimal budget = budgetRepository
            .findByUserIdAndMonthAndYearAndCategory(userId, today.getMonthValue(), today.getYear(), "Total")
            .map(Budget::getAmount)
            .orElse(DEFAULT_BUDGET);

        BigDecimal remaining = budget.subtract(totalMonth);
        double percent = budget.compareTo(BigDecimal.ZERO) > 0
            ? totalMonth.divide(budget, 4, RoundingMode.HALF_UP).doubleValue() * 100
            : 0;

        List<ExpenseResponse> recent = getRecentExpenses(userId);

        return Map.of(
            "totalMonth", totalMonth,
            "budget", budget,
            "remaining", remaining,
            "budgetPercent", percent,
            "recentExpenses", recent
        );
    }

    // --- Helpers ---

    private ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(
            e.getId(), e.getAmount(), e.getDescription(),
            e.getCategory(), classifierService.getIcon(e.getCategory()),
            e.getCreatedAt()
        );
    }

    private LocalDateTime[] getCurrentMonthRange() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = today.withDayOfMonth(today.lengthOfMonth()).atTime(LocalTime.MAX);
        return new LocalDateTime[]{start, end};
    }

    private LocalDateTime[] getPreviousMonthRange() {
        LocalDate today = LocalDate.now().minusMonths(1);
        LocalDateTime start = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = today.withDayOfMonth(today.lengthOfMonth()).atTime(LocalTime.MAX);
        return new LocalDateTime[]{start, end};
    }
}
