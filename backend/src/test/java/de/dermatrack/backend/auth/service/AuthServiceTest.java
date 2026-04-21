package de.dermatrack.backend.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

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

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private IAppUserRepository userRepository;

    @Mock
    private IRefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void register_shouldSaveUser_whenValid() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user");
        request.setPassword("pass");
        request.setEmail("mail@test.com");

        when(userRepository.existsByUsername("user")).thenReturn(false);
        when(userRepository.existsByEmail("mail@test.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encoded");
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AppUser result = authService.register(request);

        assertNotNull(result);
        assertEquals("user", result.getUsername());
        assertEquals("encoded", result.getPassword());
        assertEquals("mail@test.com", result.getEmail());
        verify(userRepository).save(argThat(user -> user.getUsername().equals("user") &&
                user.getPassword().equals("encoded") &&
                user.getEmail().equals("mail@test.com")));
    }

    @Test
    void register_shouldThrow_whenUsernameExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user");
        request.setPassword("pass");
        request.setEmail("mail@test.com");

        when(userRepository.existsByUsername("user")).thenReturn(true);

        assertThrows(UsernameAlreadyExistsException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_shouldThrow_whenEmailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user");
        request.setPassword("pass");
        request.setEmail("mail@test.com");

        when(userRepository.existsByUsername("user")).thenReturn(false);
        when(userRepository.existsByEmail("mail@test.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_shouldReturnTokens_whenValidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("pass");

        AppUser user = new AppUser();
        user.setUsername("user");
        user.setPassword("encoded");

        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "encoded")).thenReturn(true);
        when(jwtService.generateAccessToken("user")).thenReturn("access");
        when(jwtService.generateRefreshToken("user")).thenReturn("refresh");
        when(jwtService.extractRefreshTokenExpiration("refresh"))
                .thenReturn(Date.from(OffsetDateTime.now(ZoneOffset.UTC).plusDays(7).toInstant()));

        AuthResponse response = authService.login(request);

        assertEquals("access", response.getAccessToken());
        assertEquals("refresh", response.getRefreshToken());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void login_shouldThrow_whenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("pass");

        when(userRepository.findByUsername("user")).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void login_shouldThrow_whenPasswordInvalid() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("pass");

        AppUser user = new AppUser();
        user.setUsername("user");
        user.setPassword("encoded");

        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass", "encoded")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void refresh_shouldReturnNewTokens_whenValid() {
        String oldToken = "refreshToken";

        AppUser user = new AppUser();
        user.setUsername("user");

        RefreshToken persistedToken = RefreshToken.builder()
                .user(user)
                .token(oldToken)
                .expiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenAndRevokedFalse(oldToken)).thenReturn(Optional.of(persistedToken));
        when(jwtService.isRefreshTokenValid(oldToken)).thenReturn(true);
        when(jwtService.generateAccessToken("user")).thenReturn("newAccess");
        when(jwtService.generateRefreshToken("user")).thenReturn("newRefresh");
        when(jwtService.extractRefreshTokenExpiration("newRefresh"))
                .thenReturn(Date.from(OffsetDateTime.now(ZoneOffset.UTC).plusDays(7).toInstant()));

        AuthResponse response = authService.refresh(oldToken);

        assertEquals("newAccess", response.getAccessToken());
        assertEquals("newRefresh", response.getRefreshToken());
        assertTrue(persistedToken.isRevoked());
        verify(refreshTokenRepository, atLeast(2)).save(any(RefreshToken.class));
    }

    @Test
    void refresh_shouldThrow_whenInvalidToken() {
        AppUser user = new AppUser();
        user.setUsername("user");

        RefreshToken persistedToken = RefreshToken.builder()
                .user(user)
                .token("bad")
                .expiresAt(OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(10))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenAndRevokedFalse("bad")).thenReturn(Optional.of(persistedToken));
        when(jwtService.isRefreshTokenValid("bad")).thenReturn(false);

        assertThrows(InvalidRefreshTokenException.class, () -> authService.refresh("bad"));
        assertTrue(persistedToken.isRevoked());
    }

    @Test
    void refresh_shouldThrow_whenExpiredToken() {
        AppUser user = new AppUser();
        user.setUsername("user");

        RefreshToken persistedToken = RefreshToken.builder()
                .user(user)
                .token("expired")
                .expiresAt(OffsetDateTime.now(ZoneOffset.UTC).minusMinutes(10))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenAndRevokedFalse("expired")).thenReturn(Optional.of(persistedToken));

        assertThrows(InvalidRefreshTokenException.class, () -> authService.refresh("expired"));
        assertTrue(persistedToken.isRevoked());
    }

    @Test
    void refresh_shouldThrow_whenTokenNotInRepository() {
        when(refreshTokenRepository.findByTokenAndRevokedFalse("missing")).thenReturn(Optional.empty());

        assertThrows(InvalidRefreshTokenException.class, () -> authService.refresh("missing"));
    }

    @Test
    void logout_shouldDeleteTokensForCurrentUser() {
        AppUser user = new AppUser();
        UUID userId = UUID.randomUUID();
        user.setId(userId);
        user.setUsername("user");

        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("user", null));

        when(userRepository.findByUsername("user")).thenReturn(Optional.of(user));

        authService.logout();

        verify(refreshTokenRepository).deleteByUserId(userId);
    }

    @Test
    void logout_shouldThrow_whenNotAuthenticated() {
        SecurityContextHolder.clearContext();

        assertThrows(InvalidCredentialsException.class, () -> authService.logout());
    }
}
