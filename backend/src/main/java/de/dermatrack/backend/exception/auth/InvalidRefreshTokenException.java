package de.dermatrack.backend.exception.auth;

public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException(String reason) {
        super(String.format("Invalid refresh token: %s", reason));
    }
}
