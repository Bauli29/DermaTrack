package de.dermatrack.backend.config;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import de.dermatrack.backend.auth.api.model.AppUser;
import de.dermatrack.backend.auth.mock.AppUserMock;
import de.dermatrack.backend.diary.mock.DiaryEntryMock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseConfig {

    private final AppUserMock appUserMock;
    private final DiaryEntryMock diaryEntryMock;

    @Value("${app.mockdata.enabled:true}")
    private boolean mockDataEnabled;

    // Production Database

    @Bean
    @Primary
    @Profile("prod")
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
                            query);
                } else {
                    jdbcUrl = String.format(
                            "jdbc:postgresql://%s:%d%s?sslmode=require",
                            uri.getHost(),
                            port,
                            uri.getPath());
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

    // Development Mock Data

    @Bean
    @Profile("local-h2")
    public CommandLineRunner loadMockData() {
        return args -> {
            if (!mockDataEnabled) {
                log.info("Mock data generation disabled");
                return;
            }

            log.info("Generating mock data for H2 database...");

            List<AppUser> users = appUserMock.createAllUsers();
            diaryEntryMock.createEntriesForAllUsers(users);

            log.info("Mock data pushed");
        };
    }
}
