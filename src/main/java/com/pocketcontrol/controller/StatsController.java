package com.pocketcontrol.controller;

import com.pocketcontrol.dto.StatsResponse;
import com.pocketcontrol.model.User;
import com.pocketcontrol.service.AuthService;
import com.pocketcontrol.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final ExpenseService expenseService;
    private final AuthService authService;

    public StatsController(ExpenseService expenseService, AuthService authService) {
        this.expenseService = expenseService;
        this.authService = authService;
    }

    /**
     * GET /api/stats — Estadísticas del mes actual.
     */
    @GetMapping
    public ResponseEntity<?> getStats(@RequestHeader("Authorization") String auth) {
        Optional<User> user = authService.validateToken(auth);
        if (user.isEmpty()) return ResponseEntity.status(401).build();

        StatsResponse stats = expenseService.getStats(user.get().getId());
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/stats/home — Datos para la vista Home.
     */
    @GetMapping("/home")
    public ResponseEntity<?> getHomeData(@RequestHeader("Authorization") String auth) {
        Optional<User> user = authService.validateToken(auth);
        if (user.isEmpty()) return ResponseEntity.status(401).build();

        Map<String, Object> data = expenseService.getHomeData(user.get().getId());
        return ResponseEntity.ok(data);
    }
}
