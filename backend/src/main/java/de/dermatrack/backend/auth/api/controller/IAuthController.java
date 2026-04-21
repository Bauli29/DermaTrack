package de.dermatrack.backend.auth.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.dermatrack.backend.auth.api.dto.AuthResponse;
import de.dermatrack.backend.auth.api.dto.LoginRequest;
import de.dermatrack.backend.auth.api.dto.RefreshRequest;
import de.dermatrack.backend.auth.api.dto.RegisterRequest;
import de.dermatrack.backend.auth.api.dto.RegisterResponse;
import de.dermatrack.backend.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@Validated
@Tag(name = "Auth")
public interface IAuthController {

    @Operation(summary = "Register a new user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "User registered", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = RegisterResponse.class)) }),
            @ApiResponse(responseCode = "400", description = "Invalid registration payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Username or email already exists (UsernameAlreadyExistsException, EmailAlreadyExistsException)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
    @PostMapping("/register")
    ResponseEntity<RegisterResponse> register(@RequestBody @Valid RegisterRequest request);

    @Operation(summary = "Login with username and password")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login successful", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)) }),
            @ApiResponse(responseCode = "400", description = "Invalid login payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials (InvalidCredentialsException)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
    @PostMapping("/login")
    ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request);

    @Operation(summary = "Refresh access token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token refreshed", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)) }),
            @ApiResponse(responseCode = "400", description = "Invalid refresh payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token (InvalidRefreshTokenException)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
    @PostMapping("/refresh")
    ResponseEntity<AuthResponse> refresh(@RequestBody @Valid RefreshRequest request);

    @Operation(summary = "Logout current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Logged out", content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized (InvalidCredentialsException)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
    @PostMapping("/logout")
    ResponseEntity<Void> logout();
}