package com.pocketcontrol.controller;

import com.pocketcontrol.dto.ExpenseRequest;
import com.pocketcontrol.dto.ExpenseResponse;
import com.pocketcontrol.model.User;
import com.pocketcontrol.service.AuthService;
import com.pocketcontrol.service.ExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final AuthService authService;

    public ExpenseController(ExpenseService expenseService, AuthService authService) {
        this.expenseService = expenseService;
        this.authService = authService;
    }

    /**
     * POST /api/expenses — Registrar gasto con texto libre.
     * Body: { "text": "café 3500" }
     */
    @PostMapping
    public ResponseEntity<?> create(
            @RequestHeader("Authorization") String auth,
            @RequestBody ExpenseRequest request) {

        Optional<User> user = authService.validateToken(auth);
        if (user.isEmpty()) return ResponseEntity.status(401).build();

        ExpenseResponse response = expenseService.createFromText(user.get().getId(), request.getText(), request.getCategory());
        if (response == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "No se pudo extraer un monto válido del texto"));
        }
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/expenses?category=Comida — Gastos del mes, con filtro opcional.
     */
    @GetMapping
    public ResponseEntity<?> getMonthExpenses(
            @RequestHeader("Authorization") String auth,
            @RequestParam(required = false) String category) {

        Optional<User> user = authService.validateToken(auth);
        if (user.isEmpty()) return ResponseEntity.status(401).build();

        List<ExpenseResponse> expenses = expenseService.getMonthExpenses(
            user.get().getId(), category);
        return ResponseEntity.ok(expenses);
    }

    /**
     * DELETE /api/expenses/{id} — Eliminar un gasto.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {

        Optional<User> user = authService.validateToken(auth);
        if (user.isEmpty()) return ResponseEntity.status(401).build();

        boolean deleted = expenseService.deleteExpense(user.get().getId(), id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("message", "Gasto eliminado"));
    }
}
