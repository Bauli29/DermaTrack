package de.dermatrack.backend.upload.api.controller;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("ImageUploadController Integration Tests")
class ImageUploadControllerIntegrationTest {

    private static final Path UPLOAD_DIR = Path
            .of(System.getProperty("java.io.tmpdir"), "dermatrack-test-uploads-" + UUID.randomUUID());
    private static final byte[] PNG_BYTES = new byte[] {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00
    };

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IAppUserRepository appUserRepository;

    private AppUser testUser;

    @DynamicPropertySource
    static void uploadProperties(DynamicPropertyRegistry registry) {
        registry.add("app.uploads.images.storage-path", () -> UPLOAD_DIR.toString());
    }

    @AfterAll
    static void cleanUpUploads() throws IOException {
        if (!Files.exists(UPLOAD_DIR)) {
            return;
        }

        try (var files = Files.walk(UPLOAD_DIR)) {
            files.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException ignored) {
                    // Best-effort cleanup for per-test temp upload files.
                }
            });
        }
    }

    @BeforeEach
    void setUp() {
        testUser = new AppUser();
        testUser.setUsername("testuser");
        testUser.setPassword("password123");
        testUser.setEmail("test@example.com");
        testUser = appUserRepository.save(testUser);
    }

    @Test
    @DisplayName("POST and GET /api/uploads/images should store and serve the current user's image")
    void uploadAndGetImage_ShouldStoreAndServeCurrentUsersImage() throws Exception {
        MvcResult uploadResult = mockMvc.perform(multipart("/api/uploads/images")
                .file(createPngFile())
                .with(user("testuser")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.url").exists())
                .andExpect(jsonPath("$.fileName").exists())
                .andExpect(jsonPath("$.contentType").value("image/png"))
                .andReturn();

        JsonNode uploadBody = objectMapper.readTree(uploadResult.getResponse().getContentAsString());
        String fileName = uploadBody.get("fileName").asText();

        assertTrue(Files.isRegularFile(UPLOAD_DIR.resolve(testUser.getId().toString()).resolve(fileName)));

        mockMvc.perform(get("/api/uploads/images/{fileName}", fileName)
                .with(user("testuser")))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(content().bytes(PNG_BYTES));
    }

    @Test
    @DisplayName("GET /api/uploads/images/{fileName} should not serve another user's image")
    void getImage_ForDifferentUser_ShouldReturn404() throws Exception {
        MvcResult uploadResult = mockMvc.perform(multipart("/api/uploads/images")
                .file(createPngFile())
                .with(user("testuser")))
                .andExpect(status().isCreated())
                .andReturn();

        AppUser otherUser = new AppUser();
        otherUser.setUsername("otheruser");
        otherUser.setPassword("password123");
        otherUser.setEmail("other@example.com");
        appUserRepository.save(otherUser);

        String fileName = objectMapper.readTree(uploadResult.getResponse().getContentAsString())
                .get("fileName")
                .asText();

        mockMvc.perform(get("/api/uploads/images/{fileName}", fileName)
                .with(user("otheruser")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/uploads/images/{fileName} should delete the current user's image")
    void deleteImage_ShouldDeleteCurrentUsersImage() throws Exception {
        MvcResult uploadResult = mockMvc.perform(multipart("/api/uploads/images")
                .file(createPngFile())
                .with(user("testuser")))
                .andExpect(status().isCreated())
                .andReturn();

        String fileName = objectMapper.readTree(uploadResult.getResponse().getContentAsString())
                .get("fileName")
                .asText();

        mockMvc.perform(delete("/api/uploads/images/{fileName}", fileName)
                .with(user("testuser")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/uploads/images/{fileName}", fileName)
                .with(user("testuser")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/uploads/images should reject invalid files")
    void uploadImage_WithInvalidFile_ShouldReturn400() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "note.txt", "text/plain", "not an image".getBytes());

        mockMvc.perform(multipart("/api/uploads/images")
                .file(file)
                .with(user("testuser")))
                .andExpect(status().isBadRequest());
    }

    private MockMultipartFile createPngFile() {
        return new MockMultipartFile("file", "rash.png", "image/png", PNG_BYTES);
    }
}
