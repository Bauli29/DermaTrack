package de.dermatrack.backend.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.mock.AppUserMock;
import de.dermatrack.backend.diary.mock.DiaryEntryMock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Profile("local-h2")
@RequiredArgsConstructor
@Slf4j
public class MockDataConfig {

    private final AppUserMock appUserMock;
    private final DiaryEntryMock diaryEntryMock;

    @Value("${app.mockdata.enabled:true}")
    private boolean mockDataEnabled;

    @Bean
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