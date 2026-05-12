package de.dermatrack.backend.config;

import java.time.OffsetDateTime;
import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import de.dermatrack.backend.auth.jwt.JwtFilter;
import de.dermatrack.backend.exception.ErrorResponse;

@EnableMethodSecurity
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtFilter jwtFilter, Environment environment)
            throws Exception {
        boolean isLocal = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equals("local-h2") || p.equals("local") || p.equals("default"));

        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/actuator/health").permitAll();
                    auth.requestMatchers("/swagger-ui/**").permitAll();
                    auth.requestMatchers("/api/v3/api-docs/**").permitAll();
                    auth.requestMatchers("/api/auth/login").permitAll();
                    auth.requestMatchers("/api/auth/register").permitAll();
                    auth.requestMatchers("/api/auth/refresh").permitAll();
                    if (isLocal) {
                        auth.requestMatchers("/h2-console/**").permitAll();
                    }
                    auth.anyRequest().authenticated();
                })
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            ErrorResponse errorResponse = ErrorResponse.builder()
                                    .timestamp(OffsetDateTime.now())
                                    .status(401)
                                    .error("Unauthorized")
                                    .errorCode("ACCESS_TOKEN_EXPIRED")
                                    .message("Access token is missing or expired")
                                    .path(request.getRequestURI())
                                    .build();
                            ObjectMapper mapper = new ObjectMapper();
                            mapper.registerModule(new JavaTimeModule());
                            response.getWriter().write(mapper.writeValueAsString(errorResponse));
                        }))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(headers -> {
                    applyCommonSecurityHeaders(headers);
                    if (isLocal) {
                        headers.frameOptions(frameOptions -> frameOptions.disable());
                    }
                });

        return http.build();
    }

    private void applyCommonSecurityHeaders(HeadersConfigurer<HttpSecurity> headers) {
        headers.contentTypeOptions(Customizer.withDefaults());
        headers.referrerPolicy(referrerPolicy -> referrerPolicy.policy(ReferrerPolicy.NO_REFERRER));
        headers.permissionsPolicyHeader(
                permissionsPolicy -> permissionsPolicy.policy("camera=(), geolocation=(), microphone=()"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
