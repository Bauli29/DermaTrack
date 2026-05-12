package de.dermatrack.backend.auth.api.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@SuppressWarnings("unchecked")
class AuthIntegrationTest {

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private MockMvc mockMvc;

        @Test
        void register_shouldReturn201_withUserDetails() throws Exception {
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "newuser",
                                                "email", "new@example.com",
                                                "password", "securepassword1"))))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.username").value("newuser"))
                                .andExpect(jsonPath("$.email").value("new@example.com"))
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.createdAt").exists());
        }

        @Test
        void register_shouldReturn409_whenUsernameExists() throws Exception {
                String body = objectMapper.writeValueAsString(Map.of(
                                "username", "dupuser",
                                "email", "dup1@example.com",
                                "password", "securepassword1"));

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(body))
                                .andExpect(status().isCreated());

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "dupuser",
                                                "email", "dup2@example.com",
                                                "password", "securepassword1"))))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.error").value("Conflict"));
        }

        @Test
        void register_shouldReturn409_whenEmailExists() throws Exception {
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "emaildup1",
                                                "email", "dupemail@example.com",
                                                "password", "securepassword1"))))
                                .andExpect(status().isCreated());

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "emaildup2",
                                                "email", "dupemail@example.com",
                                                "password", "securepassword1"))))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.error").value("Conflict"));
        }

        @Test
        void register_shouldReturn400_whenInvalidInput() throws Exception {
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "",
                                                "email", "not-an-email",
                                                "password", "short"))))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.validationErrors").exists());
        }

        @Test
        void login_shouldReturn200_withTokens() throws Exception {
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "loginuser",
                                                "email", "login@example.com",
                                                "password", "securepassword1"))));

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "loginuser",
                                                "password", "securepassword1"))))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.accessToken").exists())
                                .andExpect(jsonPath("$.refreshToken").exists());
        }

        @Test
        void login_shouldReturn401_whenWrongPassword() throws Exception {
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "wrongpwuser",
                                                "email", "wrongpw@example.com",
                                                "password", "securepassword1"))));

                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "wrongpwuser",
                                                "password", "wrongpassword!!"))))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.error").value("Unauthorized"))
                                .andExpect(jsonPath("$.errorCode").value("INVALID_CREDENTIALS"));
        }

        @Test
        void login_shouldReturn401_whenUserNotFound() throws Exception {
                mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "nonexistent",
                                                "password", "securepassword1"))))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.error").value("Unauthorized"))
                                .andExpect(jsonPath("$.errorCode").value("INVALID_CREDENTIALS"));
        }

        @Test
        void refresh_shouldReturn200_withNewTokens() throws Exception {
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "refreshuser",
                                                "email", "refresh@example.com",
                                                "password", "securepassword1"))));

                MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "refreshuser",
                                                "password", "securepassword1"))))
                                .andReturn();

                Map<String, Object> loginResponse = objectMapper.readValue(
                                loginResult.getResponse().getContentAsString(), Map.class);
                String refreshToken = (String) loginResponse.get("refreshToken");

                mockMvc.perform(post("/api/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "refreshToken", refreshToken))))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.accessToken").exists())
                                .andExpect(jsonPath("$.refreshToken").exists());
        }

        @Test
        void refresh_shouldReturn401_whenInvalidToken() throws Exception {
                mockMvc.perform(post("/api/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "refreshToken", "invalid-token"))))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.error").value("Unauthorized"))
                                .andExpect(jsonPath("$.errorCode").value("INVALID_REFRESH_TOKEN"));
        }

        @Test
        void logout_shouldReturn204_whenAuthenticated() throws Exception {
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "logoutuser",
                                                "email", "logout@example.com",
                                                "password", "securepassword1"))));

                MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "logoutuser",
                                                "password", "securepassword1"))))
                                .andReturn();

                Map<String, Object> loginResponse = objectMapper.readValue(
                                loginResult.getResponse().getContentAsString(), Map.class);
                String accessToken = (String) loginResponse.get("accessToken");

                mockMvc.perform(post("/api/auth/logout")
                                .header("Authorization", "Bearer " + accessToken))
                                .andExpect(status().isNoContent());
        }

        @Test
        void logout_shouldReturn401_whenNotAuthenticated() throws Exception {
                mockMvc.perform(post("/api/auth/logout"))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.errorCode").value("ACCESS_TOKEN_EXPIRED"));
        }

        @Test
        void refresh_shouldReturn401_whenTokenAlreadyUsed() throws Exception {
                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "replayuser",
                                                "email", "replay@example.com",
                                                "password", "securepassword1"))));

                MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "username", "replayuser",
                                                "password", "securepassword1"))))
                                .andReturn();

                Map<String, Object> loginResponse = objectMapper.readValue(
                                loginResult.getResponse().getContentAsString(), Map.class);
                String refreshToken = (String) loginResponse.get("refreshToken");

                // First use should succeed
                mockMvc.perform(post("/api/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "refreshToken", refreshToken))))
                                .andExpect(status().isOk());
                // Replay should fail — token was revoked
                mockMvc.perform(post("/api/auth/refresh")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                                "refreshToken", refreshToken))))
                                .andExpect(status().isUnauthorized());
        }
}
