package de.dermatrack.backend.auth.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import de.dermatrack.backend.auth.api.dto.AuthResponse;
import de.dermatrack.backend.auth.api.dto.LoginRequest;
import de.dermatrack.backend.auth.api.dto.RefreshRequest;
import de.dermatrack.backend.auth.api.dto.RegisterRequest;
import de.dermatrack.backend.auth.api.dto.RegisterResponse;
import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.service.AuthService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuthController implements IAuthController {

    private final AuthService authService;

    @Override
    public ResponseEntity<RegisterResponse> register(RegisterRequest request) {
        AppUser user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(RegisterResponse.fromUser(user));
    }

    @Override
    public ResponseEntity<AuthResponse> login(LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Override
    public ResponseEntity<AuthResponse> refresh(RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.getRefreshToken()));
    }

    @Override
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> logout() {
        authService.logout();
        return ResponseEntity.noContent().build();
    }

}
