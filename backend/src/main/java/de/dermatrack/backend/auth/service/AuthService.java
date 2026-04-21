package de.dermatrack.backend.auth.service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.dermatrack.backend.auth.api.dto.AuthResponse;
import de.dermatrack.backend.auth.api.dto.LoginRequest;
import de.dermatrack.backend.auth.api.dto.RegisterRequest;
import de.dermatrack.backend.auth.jwt.JwtService;
import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.model.RefreshToken;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import de.dermatrack.backend.auth.repository.IRefreshTokenRepository;
import de.dermatrack.backend.exception.auth.EmailAlreadyExistsException;
import de.dermatrack.backend.exception.auth.InvalidCredentialsException;
import de.dermatrack.backend.exception.auth.InvalidRefreshTokenException;
import de.dermatrack.backend.exception.auth.UsernameAlreadyExistsException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IAppUserRepository userRepository;
    private final IRefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AppUser register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException(request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        AppUser user = new AppUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {

        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateAccessToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        persistRefreshToken(user, refreshToken);

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {

        RefreshToken persistedToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> new InvalidRefreshTokenException("token not found or already revoked"));

        if (persistedToken.getExpiresAt().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            persistedToken.setRevoked(true);
            refreshTokenRepository.save(persistedToken);
            throw new InvalidRefreshTokenException("token expired");
        }

        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            persistedToken.setRevoked(true);
            refreshTokenRepository.save(persistedToken);
            throw new InvalidRefreshTokenException("token validation failed");
        }

        String username = persistedToken.getUser().getUsername();

        String newAccessToken = jwtService.generateAccessToken(username);
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
            throw new InvalidCredentialsException();
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
