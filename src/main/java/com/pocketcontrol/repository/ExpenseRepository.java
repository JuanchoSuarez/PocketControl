package com.pocketcontrol.repository;

import com.pocketcontrol.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // Gastos del usuario en un rango de fechas
    List<Expense> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long userId, LocalDateTime start, LocalDateTime end);

    // Gastos del usuario por categoría en un rango
    List<Expense> findByUserIdAndCategoryAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long userId, String category, LocalDateTime start, LocalDateTime end);

    // Últimos N gastos del usuario
    List<Expense> findTop2ByUserIdOrderByCreatedAtDesc(Long userId);

    // Total de gastos en un rango
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.userId = :userId " +
           "AND e.createdAt BETWEEN :start AND :end")
    BigDecimal sumByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Total por categoría en un rango
    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0) FROM Expense e " +
           "WHERE e.userId = :userId AND e.createdAt BETWEEN :start AND :end " +
           "GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> sumByCategoryAndDateRange(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Conteo de transacciones en un rango
    long countByUserIdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    // Todos los gastos del mes del usuario
    @Query("SELECT e FROM Expense e WHERE e.userId = :userId " +
           "AND e.createdAt BETWEEN :start AND :end ORDER BY e.createdAt DESC")
    List<Expense> findAllByUserIdAndMonth(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
