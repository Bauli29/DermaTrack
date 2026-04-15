package de.dermatrack.backend.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    private final String ACCESS_SECRET = "access-secret-access-secret-access-secret-32bytes!";
    private final String REFRESH_SECRET = "refresh-secret-refresh-secret-refresh-secret-32bytes!";

    private final long ACCESS_EXPIRATION = 1000 * 60 * 15; // 15 min
    private final long REFRESH_EXPIRATION = 1000L * 60 * 60 * 24 * 7; // 7 days

    // ---------------- ACCESS TOKEN ----------------
    public String generateAccessTokens(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION))
                .signWith(getAccessKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(getRefreshKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsernameFromAccessToken(String token) {
        return getAccessClaims(token).getSubject();
    }

    public String extractUsernameFromRefreshToken(String token) {
        return getRefreshClaims(token).getSubject();
    }

    public boolean isAccessTokenValid(String token) {
        try {
            return !isAccessTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isRefreshTokenValid(String token) {
        try {
            return !isRefreshTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAccessTokenExpired(String token) {
        return getAccessClaims(token).getExpiration().before(new Date());
    }

    public boolean isRefreshTokenExpired(String token) {
        return getRefreshClaims(token).getExpiration().before(new Date());
    }

    private Claims getAccessClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getAccessKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Claims getRefreshClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getRefreshKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getAccessKey() {
        return Keys.hmacShaKeyFor(ACCESS_SECRET.getBytes());
    }

    private Key getRefreshKey() {
        return Keys.hmacShaKeyFor(REFRESH_SECRET.getBytes());
    }
}
