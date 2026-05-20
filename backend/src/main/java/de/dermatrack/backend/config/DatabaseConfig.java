package de.dermatrack.backend.config;

import java.net.URI;
import java.net.URISyntaxException;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

@Configuration
public class DatabaseConfig {

    // Production Database

    @Bean
    @Primary
    @Profile("prod")
    public DataSource prodDataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        validateDatabaseUrl(databaseUrl);

        try {
            URI uri = parsePostgresUrl(databaseUrl);
            String username = extractUsername(uri);
            String password = extractPassword(uri);
            int port = getPort(uri);
            String jdbcUrl = buildJdbcUrl(uri, port);

            return DataSourceBuilder.create()
                    .driverClassName("org.postgresql.Driver")
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .build();

        } catch (URISyntaxException e) {
            throw new RuntimeException("Invalid DATABASE_URL format", e);
        }
    }

    private void validateDatabaseUrl(String databaseUrl) {
        if (databaseUrl == null
                || (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://"))) {
            throw new RuntimeException("DATABASE_URL environment variable is required for production");
        }
    }

    private URI parsePostgresUrl(String databaseUrl) throws URISyntaxException {
        String normalizedUrl = databaseUrl.startsWith("postgres://")
                ? databaseUrl.replaceFirst("^postgres://", "postgresql://")
                : databaseUrl;
        return new URI(normalizedUrl);
    }

    private String extractUsername(URI uri) {
        String userInfo = uri.getUserInfo();
        if (userInfo != null) {
            String[] credentials = userInfo.split(":");
            return credentials[0];
        }
        return null;
    }

    private String extractPassword(URI uri) {
        String userInfo = uri.getUserInfo();
        if (userInfo != null) {
            String[] credentials = userInfo.split(":");
            if (credentials.length > 1) {
                return credentials[1];
            }
        }
        return null;
    }

    private int getPort(URI uri) {
        int port = uri.getPort();
        return port == -1 ? 5432 : port;
    }

    private String buildJdbcUrl(URI uri, int port) {
        String query = uri.getQuery();
        String baseUrl = String.format(
                "jdbc:postgresql://%s:%d%s",
                uri.getHost(),
                port,
                uri.getPath());

        if (query != null && !query.isEmpty()) {
            return baseUrl + "?" + query;
        }
        return baseUrl + "?sslmode=require";
    }
}
