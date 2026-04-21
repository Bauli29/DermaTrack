package de.dermatrack.backend.diary.api.controller;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;

/**
 * Integration tests for DiaryController
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("DiaryController Integration Tests")
class DiaryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IDiaryEntryRepository diaryEntryRepository;

    @Autowired
    private IAppUserRepository appUserRepository;

    private AppUser testUser;
    private DiaryEntry testEntry;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new AppUser();
        testUser.setUsername("testuser");
        testUser.setPassword("password123");
        testUser.setEmail("test@example.com");
        testUser = appUserRepository.save(testUser);

        // Create test diary entry
        testEntry = new DiaryEntry();
        testEntry.setUser(testUser);
        testEntry.setAllergies(5);
        testEntry.setInfections(3);
        testEntry.setStressLevel(7);
        testEntry.setSleep(6);
        testEntry.setNutrition(8);
        testEntry.setSymptoms(4);
        testEntry.setMiscellaneous("Integration test entry");
    }

    @Test
    @DisplayName("POST /api/diary should create new diary entry")
    void createDiaryEntry_ShouldReturnCreatedEntry() throws Exception {
        // Arrange
        String requestBody = buildDiaryEntryRequestBody(5, 3, 7, 6, 8, 4, "Integration test entry");

        // Act & Assert
        mockMvc.perform(post("/api/diary")
                .with(user("testuser"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.allergies").value(5))
                .andExpect(jsonPath("$.infections").value(3))
                .andExpect(jsonPath("$.stressLevel").value(7))
                .andExpect(jsonPath("$.sleep").value(6))
                .andExpect(jsonPath("$.nutrition").value(8))
                .andExpect(jsonPath("$.symptoms").value(4))
                .andExpect(jsonPath("$.miscellaneous").value("Integration test entry"))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    @DisplayName("GET /api/diary/{id} should return diary entry")
    void getDiaryEntry_WhenExists_ShouldReturnEntry() throws Exception {
        // Arrange
        DiaryEntry saved = diaryEntryRepository.save(testEntry);

        // Act & Assert
        mockMvc.perform(get("/api/diary/{id}", saved.getId())
                .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                .andExpect(jsonPath("$.allergies").value(5))
                .andExpect(jsonPath("$.miscellaneous").value("Integration test entry"));
    }

    @Test
    @DisplayName("GET /api/diary/{id} should return 404 for non-existent entry")
    void getDiaryEntry_WhenNotExists_ShouldReturn404() throws Exception {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();

        // Act & Assert
        mockMvc.perform(get("/api/diary/{id}", nonExistentId)
                .with(user("testuser")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/diary should return all diary entries")
    void getAllDiaryEntries_ShouldReturnList() throws Exception {
        // Arrange
        diaryEntryRepository.save(testEntry);

        DiaryEntry entry2 = new DiaryEntry();
        entry2.setUser(testUser);
        entry2.setAllergies(2);
        diaryEntryRepository.save(entry2);

        // Act & Assert
        mockMvc.perform(get("/api/diary")
                .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("PUT /api/diary/{id} should update diary entry")
    void updateDiaryEntry_ShouldReturnUpdatedEntry() throws Exception {
        // Arrange
        DiaryEntry saved = diaryEntryRepository.save(testEntry);
        saved.setAllergies(9);
        saved.setMiscellaneous("Updated notes");

        String requestBody = buildDiaryEntryRequestBody(9, 3, 7, 6, 8, 4, "Updated notes");

        // Act & Assert
        mockMvc.perform(put("/api/diary/{id}", saved.getId())
                .with(user("testuser"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                .andExpect(jsonPath("$.allergies").value(9))
                .andExpect(jsonPath("$.miscellaneous").value("Updated notes"));
    }

    @Test
    @DisplayName("DELETE /api/diary/{id} should delete diary entry")
    void deleteDiaryEntry_ShouldReturn204() throws Exception {
        // Arrange
        DiaryEntry saved = diaryEntryRepository.save(testEntry);

        // Act & Assert
        mockMvc.perform(delete("/api/diary/{id}", saved.getId())
                .with(user("testuser"))
                .with(csrf()))
                .andExpect(status().isNoContent());

        // Verify deletion
        mockMvc.perform(get("/api/diary/{id}", saved.getId())
                .with(user("testuser")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/diary with invalid data should return 400")
    void createDiaryEntry_WithInvalidData_ShouldReturn400() throws Exception {
        // Arrange
        String requestBody = buildDiaryEntryRequestBody(15, 3, 7, 6, 8, 4, "Integration test entry");

        // Act & Assert
        mockMvc.perform(post("/api/diary")
                .with(user("testuser"))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Accessing endpoints without authentication should return 401")
    void accessWithoutAuth_ShouldReturn401() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/diary"))
                .andExpect(status().isUnauthorized());
    }

    private String buildDiaryEntryRequestBody(int allergies, int infections, int stressLevel, int sleep,
            int nutrition, int symptoms, String miscellaneous) throws Exception {
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("allergies", allergies);
        requestBody.put("infections", infections);
        requestBody.put("stressLevel", stressLevel);
        requestBody.put("sleep", sleep);
        requestBody.put("nutrition", nutrition);
        requestBody.put("symptoms", symptoms);
        requestBody.put("miscellaneous", miscellaneous);
        return objectMapper.writeValueAsString(requestBody);
    }
}
