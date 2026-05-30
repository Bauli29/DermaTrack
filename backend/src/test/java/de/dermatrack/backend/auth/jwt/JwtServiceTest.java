package de.dermatrack.backend.auth.jwt;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class JwtServiceTest {

    private JwtService jwtService;

    private static final String ACCESS_SECRET = "test-access-secret-must-be-at-least-32bytes!";
    private static final String REFRESH_SECRET = "test-refresh-secret-must-be-at-least-32bytes!";

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        setField("accessSecret", ACCESS_SECRET);
        setField("refreshSecret", REFRESH_SECRET);
        setField("accessExpiration", 900_000L);
        setField("refreshExpiration", 604_800_000L);
        jwtService.init();
    }

    private void setField(String name, Object value) throws Exception {
        Field field = JwtService.class.getDeclaredField(name);
        field.setAccessible(true);
        field.set(jwtService, value);
    }

    @Test
    void generateAccessToken_shouldContainUsername() {
        String token = jwtService.generateAccessToken("alice");

        Claims claims = jwtService.parseAccessToken(token);
        assertThat(claims).isNotNull();
        assertThat(claims.getSubject()).isEqualTo("alice");
        assertThat(claims.getIssuer()).isEqualTo("dermatrack");
    }

    @Test
    void generateRefreshToken_shouldContainUsername() {
        String token = jwtService.generateRefreshToken("bob");

        Claims claims = jwtService.parseRefreshToken(token);
        assertThat(claims).isNotNull();
        assertThat(claims.getSubject()).isEqualTo("bob");
    }

    @Test
    void parseAccessToken_shouldReturnNull_forInvalidToken() {
        assertThat(jwtService.parseAccessToken("garbage")).isNull();
    }

    @Test
    void parseAccessToken_shouldReturnNull_forRefreshToken() {
        String refreshToken = jwtService.generateRefreshToken("alice");
        assertThat(jwtService.parseAccessToken(refreshToken)).isNull();
    }

    @Test
    void parseRefreshToken_shouldReturnNull_forAccessToken() {
        String accessToken = jwtService.generateAccessToken("alice");
        assertThat(jwtService.parseRefreshToken(accessToken)).isNull();
    }

    @Test
    void parseAccessToken_shouldReturnNull_forExpiredToken() {
        // Build an already-expired token
        String expired = Jwts.builder()
                .issuer("dermatrack")
                .subject("alice")
                .issuedAt(new Date(System.currentTimeMillis() - 20_000))
                .expiration(new Date(System.currentTimeMillis() - 10_000))
                .signWith(Keys.hmacShaKeyFor(ACCESS_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertThat(jwtService.parseAccessToken(expired)).isNull();
    }

    @Test
    void isAccessTokenValid_shouldReturnTrue_forValidToken() {
        String token = jwtService.generateAccessToken("alice");
        assertThat(jwtService.isAccessTokenValid(token)).isTrue();
    }

    @Test
    void isAccessTokenValid_shouldReturnFalse_forInvalidToken() {
        assertThat(jwtService.isAccessTokenValid("bad")).isFalse();
    }

    @Test
    void isRefreshTokenValid_shouldReturnTrue_forValidToken() {
        String token = jwtService.generateRefreshToken("alice");
        assertThat(jwtService.isRefreshTokenValid(token)).isTrue();
    }

    @Test
    void isRefreshTokenValid_shouldReturnFalse_forInvalidToken() {
        assertThat(jwtService.isRefreshTokenValid("bad")).isFalse();
    }

    @Test
    void extractUsernameFromAccessToken_shouldReturnUsername() {
        String token = jwtService.generateAccessToken("alice");
        assertThat(jwtService.extractUsernameFromAccessToken(token)).isEqualTo("alice");
    }

    @Test
    void extractUsernameFromAccessToken_shouldReturnNull_forInvalidToken() {
        assertThat(jwtService.extractUsernameFromAccessToken("bad")).isNull();
    }

    @Test
    void extractRefreshTokenExpiration_shouldReturnFutureDate() {
        String token = jwtService.generateRefreshToken("alice");
        Date expiration = jwtService.extractRefreshTokenExpiration(token);
        assertThat(expiration).isNotNull();
        assertThat(expiration).isAfter(new Date());
    }

    @Test
    void extractUsernameFromRefreshToken_shouldReturnUsername() {
        String token = jwtService.generateRefreshToken("alice");
        assertThat(jwtService.extractUsernameFromRefreshToken(token)).isEqualTo("alice");
    }

    @Test
    void extractUsernameFromRefreshToken_shouldReturnNull_forInvalidToken() {
        assertThat(jwtService.extractUsernameFromRefreshToken("bad")).isNull();
    }

    @Test
    void extractRefreshTokenExpiration_shouldReturnNull_forInvalidToken() {
        assertThat(jwtService.extractRefreshTokenExpiration("bad")).isNull();
    }

    @Test
    void parseAccessToken_shouldReturnNull_forWrongIssuer() {
        String wrongIssuer = Jwts.builder()
                .issuer("wrong-issuer")
                .subject("alice")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 900_000))
                .signWith(Keys.hmacShaKeyFor(ACCESS_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertThat(jwtService.parseAccessToken(wrongIssuer)).isNull();
    }
}
