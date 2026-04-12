package de.dermatrack.backend.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;
import java.util.Date;

@Service
// This service is handles cases of
// token creation,
// then validation and also
// extracgting usernames
public class JwtService {
    private final String ACCESS_SECRET = "access-secret";
    private final String REFRESH_SECRET = "refresh-secret";
    private final long ACCESS_EXPIRATION = 1000 * 60 * 15; // i.e 15 mins
    private final long REFRESH_EXPIRATION = 1000L * 60 * 60 * 24 * 7; // 7 days

    // Now we gfirst generate the access tokens
    public String generateAccessTokens(String username) {
        return Jwts.builder().setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, ACCESS_SECRET)
                .compact();
    }

    // Now that we have generated the Accesstokens we will now generate
    // refreshtokens
    public String generateRefreshToken(String username) {
        return Jwts.builder().setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, REFRESH_SECRET)
                .compact();

    }

    public String extractUsernameFromAccessToken(String token) {
        return getClaims(token, ACCESS_SECRET).getSubject();
    }

    public String extractUsernameFromRefreshToken(String token) {
        return getClaims(token, REFRESH_SECRET).getSubject();
    }

    // Now we gotta Validate the token we got! BAÄÄM BÄÄM BÄÄM!!!
    public boolean isAccessTokenValid(String token) {
        try {
            return getClaims(token, ACCESS_SECRET)
                    .getExpiration()
                    .after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isRefreshTokenValid(String token) {
        try {
            return getClaims(token, REFRESH_SECRET)
                    .getExpiration()
                    .after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // now comes getClaims() part!!! DAYUMNNN DIGS!! WE DIG IT!
    public Claims getClaims(String token, String secret) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }
}
