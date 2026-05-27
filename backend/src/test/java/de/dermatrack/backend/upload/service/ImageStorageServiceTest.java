package de.dermatrack.backend.upload.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import de.dermatrack.backend.exception.ResourceNotFoundException;
import de.dermatrack.backend.upload.api.dto.ImageUploadResponse;
import de.dermatrack.backend.upload.config.ImageUploadProperties;

@DisplayName("ImageStorageService Tests")
class ImageStorageServiceTest {

    private static final byte[] PNG_BYTES = new byte[] {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00
    };

    @TempDir
    private Path uploadDir;

    private ImageStorageService imageStorageService;

    @BeforeEach
    void setUp() {
        ImageUploadProperties properties = new ImageUploadProperties();
        properties.setStoragePath(uploadDir.toString());
        imageStorageService = new ImageStorageService(properties);
    }

    @Test
    @DisplayName("store should write image under the authenticated user's directory")
    void store_ShouldWriteImageUnderUserDirectory() throws Exception {
        UUID userId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile("file", "rash.png", "image/png", PNG_BYTES);

        ImageUploadResponse response = imageStorageService.store(userId, file);

        assertTrue(response.getUrl().startsWith("/api/uploads/images/"));
        assertTrue(response.getFileName().endsWith(".png"));
        assertEquals("image/png", response.getContentType());
        assertEquals(PNG_BYTES.length, response.getSize());
        assertTrue(Files.isRegularFile(uploadDir.resolve(userId.toString()).resolve(response.getFileName())));
    }

    @Test
    @DisplayName("load should only read images from the current user's directory")
    void load_ShouldOnlyReadCurrentUsersImages() {
        UUID ownerId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile("file", "rash.png", "image/png", PNG_BYTES);
        ImageUploadResponse response = imageStorageService.store(ownerId, file);

        StoredImageResource storedImage = imageStorageService.load(ownerId, response.getFileName());

        assertEquals("image/png", storedImage.contentType());
        assertEquals(PNG_BYTES.length, storedImage.contentLength());
        assertThrows(
                ResourceNotFoundException.class,
                () -> imageStorageService.load(otherUserId, response.getFileName()));
    }

    @Test
    @DisplayName("store should reject non-image content")
    void store_ShouldRejectNonImageContent() {
        UUID userId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile("file", "note.txt", "text/plain", "not an image".getBytes());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> imageStorageService.store(userId, file));

        assertEquals("Only JPEG and PNG images are allowed.", exception.getMessage());
    }
}
