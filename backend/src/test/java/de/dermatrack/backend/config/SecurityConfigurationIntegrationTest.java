package de.dermatrack.backend.config;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.http.HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS;
import static org.springframework.http.HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN;
import static org.springframework.http.HttpHeaders.ORIGIN;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "app.mockdata.enabled=false",
        "app.security.cors.allowed-origins=http://allowed.example",
        "app.security.cors.allowed-methods=GET,POST,OPTIONS",
        "app.security.cors.allowed-headers=Authorization,Content-Type",
        "app.security.cors.allow-credentials=false",
        "app.security.cors.max-age-seconds=600"
})
@AutoConfigureMockMvc
@ActiveProfiles("local-h2")
@DisplayName("Security Configuration Integration Tests")
class SecurityConfigurationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Preflight requests should use configured CORS settings")
    void corsPreflight_ShouldUseConfiguredSettings() throws Exception {
        mockMvc.perform(options("/api/diary")
                .header(ORIGIN, "http://allowed.example")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization,Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(ACCESS_CONTROL_ALLOW_ORIGIN, "http://allowed.example"))
                .andExpect(header().string(ACCESS_CONTROL_ALLOW_HEADERS, containsString("Authorization")))
                .andExpect(header().string(ACCESS_CONTROL_ALLOW_HEADERS, containsString("Content-Type")))
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS));
    }

    @Test
    @DisplayName("Responses should include hardened security headers")
    void healthEndpoint_ShouldIncludeSecurityHeaders() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(header().string("Permissions-Policy", "camera=(), geolocation=(), microphone=()"));
    }
}
