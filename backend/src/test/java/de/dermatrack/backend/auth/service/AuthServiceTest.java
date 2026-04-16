package de.dermatrack.backend.auth.service;

import de.dermatrack.backend.auth.api.dto.AuthResponse;
import de.dermatrack.backend.auth.api.dto.LoginRequest;
import de.dermatrack.backend.auth.api.dto.RegisterRequest;
import de.dermatrack.backend.auth.api.model.AppUser;
import de.dermatrack.backend.auth.api.repository.IAppUserRepository;
import de.dermatrack.backend.auth.jwt.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private IAppUserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_shouldSaveUser_whenValid() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("user");
        request.setPassword("pass");
        request.setEmail("mail@test.com");

        when(userRepository.existsByUsername("user")).thenReturn(false);
        when(userRepository.existsByEmail("mail@test.com")).thenReturn(false);
        when(passwordEncoder.encode("pass")).thenReturn("encoded");

        authService.register(request);

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

        assertThrows(RuntimeException.class, () -> authService.register(request));
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

        assertThrows(RuntimeException.class, () -> authService.register(request));
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
        when(jwtService.generateAccessTokens("user")).thenReturn("access");
        when(jwtService.generateRefreshToken("user")).thenReturn("refresh");

        AuthResponse response = authService.login(request);

        assertEquals("access", response.getAccessToken());
        assertEquals("refresh", response.getRefreshToken());
    }

    @Test
    void login_shouldThrow_whenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setUsername("user");
        request.setPassword("pass");

        when(userRepository.findByUsername("user")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.login(request));
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

        assertThrows(RuntimeException.class, () -> authService.login(request));
    }

    @Test
    void refresh_shouldReturnNewTokens_whenValid() {
        String token = "refreshToken";

        when(jwtService.isRefreshTokenValid(token)).thenReturn(true);
        when(jwtService.extractUsernameFromRefreshToken(token)).thenReturn("user");
        when(jwtService.generateAccessTokens("user")).thenReturn("newAccess");
        when(jwtService.generateRefreshToken("user")).thenReturn("newRefresh");

        AuthResponse response = authService.refresh(token);

        assertEquals("newAccess", response.getAccessToken());
        assertEquals("newRefresh", response.getRefreshToken());
    }

    @Test
    void refresh_shouldThrow_whenInvalidToken() {
        when(jwtService.isRefreshTokenValid("bad")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.refresh("bad"));
    }
}
