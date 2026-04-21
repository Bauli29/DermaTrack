package de.dermatrack.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Profile("prod")
@Slf4j
public class ProdAuthBootstrapConfig {

    @Value("${app.auth.username}")
    private String username;

    @Value("${app.auth.password}")
    private String password;

    @Value("${app.auth.email:}")
    private String email;

    @Bean
    public CommandLineRunner ensureProdAuthUser(IAppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (appUserRepository.findByUsername(username).isPresent()) {
                return;
            }

            AppUser user = new AppUser();
            user.setUsername(username);
            user.setEmail(resolveEmail(username));
            user.setPassword(passwordEncoder.encode(password));

            appUserRepository.save(user);
            log.info("Created initial production auth user '{}'", username);
        };
    }

    private String resolveEmail(String fallbackUsername) {
        if (email != null && !email.isBlank()) {
            return email;
        }
        return fallbackUsername + "@dermatrack.local";
    }
}
