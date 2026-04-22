package com.pocketcontrol.repository;

import com.pocketcontrol.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserIdAndMonthAndYearAndCategory(Long userId, Integer month, Integer year, String category);
    List<Budget> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);
}