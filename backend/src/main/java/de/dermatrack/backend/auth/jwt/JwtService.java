package de.dermatrack.backend.auth.jwt;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Service
public class JwtService {

    private static final String ISSUER = "dermatrack";

    @Value("${app.jwt.access-secret}")
    private String accessSecret;

    @Value("${app.jwt.refresh-secret}")
    private String refreshSecret;

    @Value("${app.jwt.access-expiration-ms:900000}")
    private long accessExpiration; // default 15 min

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long refreshExpiration; // default 7 days

    private SecretKey accessKey;
    private SecretKey refreshKey;

    @PostConstruct
    void init() {
        this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes());
        this.refreshKey = Keys.hmacShaKeyFor(refreshSecret.getBytes());
    }

    public String generateAccessToken(String username) {
        return Jwts.builder()
                .issuer(ISSUER)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(accessKey)
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .issuer(ISSUER)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(refreshKey)
                .compact();
    }

    /**
     * Parse and validate an access token, returning its claims.
     * Returns null if the token is invalid, expired, or has a wrong issuer.
     */
    public Claims parseAccessToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(accessKey)
                    .requireIssuer(ISSUER)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Parse and validate a refresh token, returning its claims.
     * Returns null if the token is invalid, expired, or has a wrong issuer.
     */
    public Claims parseRefreshToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(refreshKey)
                    .requireIssuer(ISSUER)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUsernameFromAccessToken(String token) {
        Claims claims = parseAccessToken(token);
        return claims != null ? claims.getSubject() : null;
    }

    public String extractUsernameFromRefreshToken(String token) {
        Claims claims = parseRefreshToken(token);
        return claims != null ? claims.getSubject() : null;
    }

    public Date extractRefreshTokenExpiration(String token) {
        Claims claims = parseRefreshToken(token);
        return claims != null ? claims.getExpiration() : null;
    }

    public boolean isAccessTokenValid(String token) {
        return parseAccessToken(token) != null;
    }

    public boolean isRefreshTokenValid(String token) {
        return parseRefreshToken(token) != null;
    }
}
