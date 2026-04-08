package com.pocketcontrol.service;

import com.pocketcontrol.dto.AuthRequest;
import com.pocketcontrol.dto.AuthResponse;
import com.pocketcontrol.model.User;
import com.pocketcontrol.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Registra un nuevo usuario.
     */
    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, null, "El correo ya está registrado");
        }

        String hash = hashPassword(request.getPassword());
        String token = UUID.randomUUID().toString();

        User user = new User(request.getEmail(), hash);
        user.setAuthToken(token);
        userRepository.save(user);

        return new AuthResponse(token, user.getEmail(), "Registro exitoso");
    }

    /**
     * Inicia sesión con email y contraseña.
     */
    public AuthResponse login(AuthRequest request) {
        Optional<User> optUser = userRepository.findByEmail(request.getEmail());
        if (optUser.isEmpty()) {
            return new AuthResponse(null, null, "Correo o contraseña incorrectos");
        }

        User user = optUser.get();
        String hash = hashPassword(request.getPassword());
        if (!hash.equals(user.getPasswordHash())) {
            return new AuthResponse(null, null, "Correo o contraseña incorrectos");
        }

        // Generar nuevo token en cada login
        String token = UUID.randomUUID().toString();
        user.setAuthToken(token);
        userRepository.save(user);

        return new AuthResponse(token, user.getEmail(), "Login exitoso");
    }

    /**
     * Valida un token y retorna el usuario asociado.
     */
    public Optional<User> validateToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = authHeader.substring(7);
        return userRepository.findByAuthToken(token);
    }

    /**
     * Hash simple con SHA-256 (suficiente para un proyecto universitario).
     */
    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(password.getBytes());
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al generar hash", e);
        }
    }
}
