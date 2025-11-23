package de.dermatrack.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(getAllowedOrigins())
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    private String[] getAllowedOrigins() {
        return new String[] {
                // ===========================================
                // FRONTEND URLS - All allowed origins
                // ===========================================

                // LOCAL DEVELOPMENT
                "http://localhost:3000", // React/Next.js default

                // PRODUCTION DEPLOYMENT
                "https://derma-track.vercel.app" // Production frontend

                // ===========================================
        };
    }
}
