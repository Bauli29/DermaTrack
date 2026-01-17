package de.dermatrack.backend.diary.api.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import de.dermatrack.backend.auth.api.model.AppUser;
import de.dermatrack.backend.auth.api.repository.IAppUserRepository;
import de.dermatrack.backend.diary.api.model.DiaryEntry;
import de.dermatrack.backend.diary.api.repository.IDiaryEntryRepository;

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
    @WithMockUser(username = "testuser")
    @DisplayName("POST /api/diary should create new diary entry")
    void createDiaryEntry_ShouldReturnCreatedEntry() throws Exception {
        // Arrange
        String requestBody = objectMapper.writeValueAsString(testEntry);

        // Act & Assert
        mockMvc.perform(post("/api/diary")
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
    @WithMockUser(username = "testuser")
    @DisplayName("GET /api/diary/{id} should return diary entry")
    void getDiaryEntry_WhenExists_ShouldReturnEntry() throws Exception {
        // Arrange
        DiaryEntry saved = diaryEntryRepository.save(testEntry);

        // Act & Assert
        mockMvc.perform(get("/api/diary/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                .andExpect(jsonPath("$.allergies").value(5))
                .andExpect(jsonPath("$.miscellaneous").value("Integration test entry"));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("GET /api/diary/{id} should return 404 for non-existent entry")
    void getDiaryEntry_WhenNotExists_ShouldReturn404() throws Exception {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();

        // Act & Assert
        mockMvc.perform(get("/api/diary/{id}", nonExistentId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("GET /api/diary should return all diary entries")
    void getAllDiaryEntries_ShouldReturnList() throws Exception {
        // Arrange
        diaryEntryRepository.save(testEntry);

        DiaryEntry entry2 = new DiaryEntry();
        entry2.setUser(testUser);
        entry2.setAllergies(2);
        diaryEntryRepository.save(entry2);

        // Act & Assert
        mockMvc.perform(get("/api/diary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("PUT /api/diary/{id} should update diary entry")
    void updateDiaryEntry_ShouldReturnUpdatedEntry() throws Exception {
        // Arrange
        DiaryEntry saved = diaryEntryRepository.save(testEntry);
        saved.setAllergies(9);
        saved.setMiscellaneous("Updated notes");

        String requestBody = objectMapper.writeValueAsString(saved);

        // Act & Assert
        mockMvc.perform(put("/api/diary/{id}", saved.getId())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                .andExpect(jsonPath("$.allergies").value(9))
                .andExpect(jsonPath("$.miscellaneous").value("Updated notes"));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("DELETE /api/diary/{id} should delete diary entry")
    void deleteDiaryEntry_ShouldReturn204() throws Exception {
        // Arrange
        DiaryEntry saved = diaryEntryRepository.save(testEntry);

        // Act & Assert
        mockMvc.perform(delete("/api/diary/{id}", saved.getId())
                .with(csrf()))
                .andExpect(status().isNoContent());

        // Verify deletion
        mockMvc.perform(get("/api/diary/{id}", saved.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("POST /api/diary with invalid data should return 400")
    void createDiaryEntry_WithInvalidData_ShouldReturn400() throws Exception {
        // Arrange
        testEntry.setAllergies(15); // Invalid: exceeds max value of 10

        String requestBody = objectMapper.writeValueAsString(testEntry);

        // Act & Assert
        mockMvc.perform(post("/api/diary")
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
}
