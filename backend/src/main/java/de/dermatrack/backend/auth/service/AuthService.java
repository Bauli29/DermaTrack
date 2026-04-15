package de.dermatrack.backend.auth.service;

import de.dermatrack.backend.auth.api.repository.IAppUserRepository;
import de.dermatrack.backend.auth.api.dto.*;
import de.dermatrack.backend.auth.jwt.JwtService;
import de.dermatrack.backend.auth.api.model.AppUser;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IAppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // ---------------- REGISTER ----------------
    public void register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);
    }

    // ---------------- LOGIN ----------------
    public AuthResponse login(LoginRequest request) {

        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String accessToken = jwtService.generateAccessTokens(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        return new AuthResponse(accessToken, refreshToken);
    }

    // ---------------- REFRESH ----------------
    public AuthResponse refresh(String refreshToken) {

        // validate using refresh-specific logic
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String username = jwtService.extractUsernameFromRefreshToken(refreshToken);

        String newAccessToken = jwtService.generateAccessTokens(username);
        String newRefreshToken = jwtService.generateRefreshToken(username);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    // ---------------- LOGOUT ----------------
    public void logout() {
        // Stateless JWT:
        // nothing happens on backend
        // client deletes tokens
    }
}
