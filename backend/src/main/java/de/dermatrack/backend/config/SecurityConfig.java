package de.dermatrack.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    @Profile("local") // Only for local development against dev database
    public SecurityFilterChain localSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)               // Disable CSRF for API testing
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()        // Allow all API operations (GET, POST, PUT, DELETE)
                .requestMatchers("/actuator/**").permitAll()   // Allow health checks and monitoring
                .anyRequest().permitAll()                        // Allow everything else too
            );
        
        return http.build();
    }
    
    //production
    @Bean
    @Profile("prod")
    public SecurityFilterChain prodSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(org.springframework.security.web.csrf.CookieCsrfTokenRepository.withHttpOnlyFalse())
            ) // Enable CSRF for production
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll() // Only health check public
                .anyRequest().authenticated() // Everything else requires authentication
            );
        
        return http.build();
    }
}