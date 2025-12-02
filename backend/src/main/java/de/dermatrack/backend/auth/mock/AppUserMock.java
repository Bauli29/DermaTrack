package de.dermatrack.backend.auth.mock;

import java.util.ArrayList;
import java.util.List;

import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import de.dermatrack.backend.auth.api.model.AppUser;
import de.dermatrack.backend.auth.api.repository.IAppUserRepository;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;

@Component
@Profile("local-h2")
@RequiredArgsConstructor
public class AppUserMock {

    private final IAppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final Faker faker = new Faker();

    public List<AppUser> createAllUsers() {
        List<AppUser> users = new ArrayList<>();

        // Test users with known password
        users.add(createUser("testuser1", "test1@example.com"));
        users.add(createUser("testuser2", "test2@example.com"));

        // 3 random users with valid usernames
        for (int i = 0; i < 3; i++) {
            String username = faker.credentials().username().replaceAll("[^a-zA-Z0-9_-]", "");
            users.add(createUser(username, faker.internet().emailAddress()));
        }

        return users;
    }

    private AppUser createUser(String username, String email) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password123"));
        return appUserRepository.save(user);
    }
}
