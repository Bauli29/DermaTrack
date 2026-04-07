package de.dermatrack.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class CorsConfig implements WebMvcConfigurer {

    private final SecurityProperties securityProperties;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(securityProperties.getCors().getAllowedOrigins().toArray(String[]::new))
                .allowedMethods(securityProperties.getCors().getAllowedMethods().toArray(String[]::new))
                .allowedHeaders(securityProperties.getCors().getAllowedHeaders().toArray(String[]::new))
                .allowCredentials(securityProperties.getCors().isAllowCredentials())
                .maxAge(securityProperties.getCors().getMaxAgeSeconds());
    }
}
