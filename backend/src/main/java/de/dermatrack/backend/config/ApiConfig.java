package de.dermatrack.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ApiConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Add /api prefix to all @RestController classes
        configurer.addPathPrefix("/api",
                c -> c.isAnnotationPresent(org.springframework.web.bind.annotation.RestController.class));
    }
}