package de.dermatrack.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;

import de.dermatrack.backend.auth.jwt.JwtFilter;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@EnableMethodSecurity

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    @Profile({ "local-h2", "local" }) // Only for local development (H2 or local real DB)
    public SecurityFilterChain localSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> {
                    auth.anyRequest().permitAll(); // Allow everything
                })
                .headers(headers -> {
                    applyCommonSecurityHeaders(headers);
                    headers.frameOptions(frameOptions -> frameOptions.disable()); // Required for H2 console
                });

        return http.build();
    }

    @Bean
    @Profile("prod")
    public SecurityFilterChain prodSecurityFilterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/actuator/health").permitAll(); // Only health check public
                    auth.requestMatchers("/api/auth/**").permitAll(); // API requires authentication
                    auth.anyRequest().authenticated(); // Everything else requires authentication
                })
                // .httpBasic(Customizer.withDefaults())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .headers(this::applyCommonSecurityHeaders);

        return http.build();
    }
    /*
     * public SecurityFilterChain prodSecurityFilterChain(HttpSecurity http) throws
     * Exception
     * http
     * .csrf(AbstractHttpConfigurer::disable)
     * .cors(Customizer.withDefaults())
     * .authorizeHttpRequests(auth -> auth
     * .requestMatchers("/actuator/health").permitAll() // Only health check public
     * .requestMatchers("/api/**").authenticated() // API requires authentication
     * .anyRequest().authenticated() // Everything else requires authentication
     * )
     * .httpBasic(Customizer.withDefaults())
     * .headers(this::applyCommonSecurityHeaders);
     * 
     * return http.build();
     * }
     */

    private void applyCommonSecurityHeaders(HeadersConfigurer<HttpSecurity> headers) {
        headers.contentTypeOptions(Customizer.withDefaults());
        headers.referrerPolicy(referrerPolicy -> referrerPolicy.policy(ReferrerPolicy.NO_REFERRER));
        headers.permissionsPolicyHeader(
                permissionsPolicy -> permissionsPolicy.policy("camera=(), geolocation=(), microphone=()"));
    }

    @Bean
    @Profile("prod")
    public UserDetailsService userDetailsService() {
        String username = "admin"; // TODO: Use environment variable
        String password = "password"; // TODO: Use environment variable
        UserDetails user = User.builder()
                .username(username)
                .password(passwordEncoder().encode(password))
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(user);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
