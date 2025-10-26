package de.dermatrack.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl != null && databaseUrl.startsWith("postgresql://")) {
            // Convert Supabase/Heroku/Neon style URL to JDBC URL with SSL
            try {
                URI uri = new URI(databaseUrl);
                
                // Extract username and password
                String userInfo = uri.getUserInfo();
                String username = null;
                String password = null;
                
                if (userInfo != null) {
                    String[] credentials = userInfo.split(":");
                    username = credentials[0];
                    if (credentials.length > 1) {
                        password = credentials[1];
                    }
                }
                
                // Handle default port for PostgreSQL
                int port = uri.getPort();
                if (port == -1) {
                    port = 5432; // Default PostgreSQL port
                }
                
                // Build JDBC URL - erweitert für Neon
                String jdbcUrl;
                String query = uri.getQuery();
                if (query != null && !query.isEmpty()) {
                    // Preserve existing query parameters (like sslmode, channel_binding)
                    jdbcUrl = String.format(
                        "jdbc:postgresql://%s:%d%s?%s",
                        uri.getHost(),
                        port,
                        uri.getPath(),
                        query
                    );
                } else {
                    // Default with SSL
                    jdbcUrl = String.format(
                        "jdbc:postgresql://%s:%d%s?sslmode=require",
                        uri.getHost(),
                        port,
                        uri.getPath()
                    );
                }
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
        
        // Fallback to default Spring Boot configuration
        return DataSourceBuilder.create().build();
    }
}