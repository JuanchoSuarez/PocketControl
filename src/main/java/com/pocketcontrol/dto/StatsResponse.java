package com.pocketcontrol.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class StatsResponse {
    private BigDecimal totalMonth;
    private BigDecimal totalPrevMonth;
    private long transactionCount;
    private BigDecimal averagePerDay;
    private BigDecimal budget;
    private double budgetPercent;
    private List<CategoryStat> categories;

    // Clase interna para estadísticas por categoría
    public static class CategoryStat {
        private String category;
        private String icon;
        private BigDecimal total;
        private double percent;

        public CategoryStat() {}
        public CategoryStat(String category, String icon, BigDecimal total, double percent) {
            this.category = category;
            this.icon = icon;
            this.total = total;
            this.percent = percent;
        }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }
        public double getPercent() { return percent; }
        public void setPercent(double percent) { this.percent = percent; }
    }

    // Getters y Setters
    public BigDecimal getTotalMonth() { return totalMonth; }
    public void setTotalMonth(BigDecimal totalMonth) { this.totalMonth = totalMonth; }
    public BigDecimal getTotalPrevMonth() { return totalPrevMonth; }
    public void setTotalPrevMonth(BigDecimal totalPrevMonth) { this.totalPrevMonth = totalPrevMonth; }
    public long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(long transactionCount) { this.transactionCount = transactionCount; }
    public BigDecimal getAveragePerDay() { return averagePerDay; }
    public void setAveragePerDay(BigDecimal averagePerDay) { this.averagePerDay = averagePerDay; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public double getBudgetPercent() { return budgetPercent; }
    public void setBudgetPercent(double budgetPercent) { this.budgetPercent = budgetPercent; }
    public List<CategoryStat> getCategories() { return categories; }
    public void setCategories(List<CategoryStat> categories) { this.categories = categories; }
}
