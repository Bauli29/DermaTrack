package de.dermatrack.backend.auth.service;

import de.dermatrack.backend.auth.api.repository.IAppUserRepository;
import de.dermatrack.backend.auth.api.dto.*;
import de.dermatrack.backend.auth.jwt.JwtService;
import de.dermatrack.backend.auth.api.model.AppUser;
import de.dermatrack.backend.auth.api.model.RefreshToken;
import de.dermatrack.backend.auth.api.repository.IRefreshTokenRepository;
import lombok.RequiredArgsConstructor;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IAppUserRepository userRepository;
    private final IRefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {

        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String accessToken = jwtService.generateAccessTokens(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        persistRefreshToken(user, refreshToken);

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {

        RefreshToken persistedToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (persistedToken.getExpiresAt().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            persistedToken.setRevoked(true);
            refreshTokenRepository.save(persistedToken);
            throw new RuntimeException("Refresh token expired");
        }

        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            persistedToken.setRevoked(true);
            refreshTokenRepository.save(persistedToken);
            throw new RuntimeException("Invalid refresh token");
        }

        String username = persistedToken.getUser().getUsername();

        String newAccessToken = jwtService.generateAccessTokens(username);
        String newRefreshToken = jwtService.generateRefreshToken(username);

        persistedToken.setRevoked(true);
        refreshTokenRepository.save(persistedToken);

        persistRefreshToken(persistedToken.getUser(), newRefreshToken);

        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return;
        }

        String username = authentication.getName();
        userRepository.findByUsername(username)
                .ifPresent(user -> refreshTokenRepository.deleteByUserId(user.getId()));
    }

    private void persistRefreshToken(AppUser user, String refreshToken) {
        OffsetDateTime expiresAt = OffsetDateTime.ofInstant(
                jwtService.extractRefreshTokenExpiration(refreshToken).toInstant(),
                ZoneOffset.UTC);

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(expiresAt)
                .build();

        refreshTokenRepository.save(refreshTokenEntity);
    }
}
