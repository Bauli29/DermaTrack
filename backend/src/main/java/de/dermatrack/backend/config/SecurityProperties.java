package de.dermatrack.backend.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "app.security")
@Validated
@Getter
@Setter
public class SecurityProperties {

    private final Cors cors = new Cors();

    @Getter
    @Setter
    public static class Cors {

        @NotEmpty
        private List<String> allowedOrigins = List.of(
                "http://localhost:3000",
                "https://derma-track.vercel.app");

        @NotEmpty
        private List<String> allowedMethods = List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS");

        @NotEmpty
        private List<String> allowedHeaders = List.of(
                "Authorization",
                "Content-Type",
                "Accept");

        private boolean allowCredentials = true;

        private long maxAgeSeconds = 3600;
    }
}
