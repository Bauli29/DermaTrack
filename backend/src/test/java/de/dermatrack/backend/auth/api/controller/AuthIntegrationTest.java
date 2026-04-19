package de.dermatrack.backend.auth.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthIntegrationTest {

        @Autowired
        private WebApplicationContext wac;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private ApplicationContext context;

        private MockMvc mockMvc;

        @BeforeEach
        void setup() {

                mockMvc = webAppContextSetup(wac)

                                .build();
        }

        @Test
        void debugMappings() {
                Map<String, Object> controllers = context.getBeansWithAnnotation(RestController.class);

                System.out.println("=== REGISTERED REST CONTROLLERS ===");
                controllers.forEach((name, bean) -> System.out.println(name + " -> " + bean.getClass().getName()));
                System.out.println("=== END ===");
        }

        @Test
        void fullAuthFlow_shouldWork() throws Exception {

                Map<String, String> registerRequest = Map.of(
                                "username", "testuser1",
                                "email", "test1@example.com",
                                "password", "1234562");

                mockMvc.perform(post("/api/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(registerRequest)))
                                .andExpect(status().is2xxSuccessful());

                Map<String, String> loginRequest = Map.of(
                                "username", "testuser1",
                                "password", "1234562");

                MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(loginRequest)))
                                .andDo(print())
                                .andExpect(status().is2xxSuccessful())
                                .andReturn();

                String responseBody = loginResult.getResponse().getContentAsString();
                Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);

                String token = (String) responseMap.get("accessToken");

                assertThat(token).isNotNull();
        }
}
