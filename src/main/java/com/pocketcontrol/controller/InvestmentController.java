package com.pocketcontrol.controller;

import com.pocketcontrol.model.Investment;
import com.pocketcontrol.model.User;
import com.pocketcontrol.repository.InvestmentRepository;
import com.pocketcontrol.repository.UserRepository;
import com.pocketcontrol.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final InvestmentRepository investmentRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public InvestmentController(InvestmentRepository investmentRepository,
                               UserRepository userRepository,
                               AuthService authService) {
        this.investmentRepository = investmentRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    /**
     * GET /api/investments — Listar inversiones del usuario.
     */
    @GetMapping
    public ResponseEntity<?> list(@RequestHeader("Authorization") String auth) {
        Optional<User> user = authService.validateToken(auth);
        if (user.isEmpty()) return ResponseEntity.status(401).build();

        List<Investment> investments = investmentRepository
            .findByUserIdOrderByCreatedAtDesc(user.get().getId());
        return ResponseEntity.ok(investments);
    }

    /**
     * POST /api/investments — Crear una inversión.
     * Body: { "name": "CDT Bancolombia", "amount": 1000000, "type": "CDT" }
     */
    @PostMapping
    public ResponseEntity<?> create(
            @RequestHeader("Authorization") String auth,
            @RequestBody Investment request) {

        Optional<User> user = authService.validateToken(auth);
        if (user.isEmpty()) return ResponseEntity.status(401).build();

        Investment investment = new Investment(
            user.get().getId(), request.getName(),
            request.getAmount(), request.getType(),
            request.getDuration(), request.getCreatedAt()
        );
        investment = investmentRepository.save(investment);
        
        userRepository.findById(user.get().getId()).ifPresent(u -> {
            u.setStars(u.getStars() + 5);
            userRepository.save(u);
        });
        
        return ResponseEntity.ok(investment);
    }

    /**
     * DELETE /api/investments/{id} — Eliminar una inversión.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @RequestHeader("Authorization") String auth,
            @PathVariable Long id) {

        Optional<User> user = authService.validateToken(auth);
        if (user.isEmpty()) return ResponseEntity.status(401).build();

        return investmentRepository.findById(id)
            .filter(inv -> inv.getUserId().equals(user.get().getId()))
            .map(inv -> {
                investmentRepository.delete(inv);
                return ResponseEntity.ok(Map.of("message", "Inversión eliminada"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
