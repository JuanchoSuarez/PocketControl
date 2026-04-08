package com.pocketcontrol.repository;

import com.pocketcontrol.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
