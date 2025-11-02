package de.dermatrack.backend.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Bean
    @Primary
    @Profile("prod")  // NUR für Production!
    public DataSource prodDataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl != null && databaseUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(databaseUrl);
                
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
                
                int port = uri.getPort();
                if (port == -1) {
                    port = 5432;
                }
                
                String jdbcUrl;
                String query = uri.getQuery();
                if (query != null && !query.isEmpty()) {
                    jdbcUrl = String.format(
                        "jdbc:postgresql://%s:%d%s?%s",
                        uri.getHost(),
                        port,
                        uri.getPath(),
                        query
                    );
                } else {
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
        
        throw new RuntimeException("DATABASE_URL environment variable is required for production");
    }
}
