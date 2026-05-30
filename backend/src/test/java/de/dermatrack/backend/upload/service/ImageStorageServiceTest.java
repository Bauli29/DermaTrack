package de.dermatrack.backend.upload.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.jspecify.annotations.NonNull;
import org.springframework.mock.web.MockMultipartFile;

import de.dermatrack.backend.exception.ResourceNotFoundException;
import de.dermatrack.backend.upload.api.dto.ImageUploadResponse;
import de.dermatrack.backend.upload.config.ImageUploadProperties;

@DisplayName("ImageStorageService Tests")
class ImageStorageServiceTest {

    private static final byte[] PNG_BYTES = new byte[] {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00
    };
    private static final byte[] JPEG_BYTES = new byte[] {
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00, 0x11
    };

    @TempDir
    private Path uploadDir;

    private ImageStorageService imageStorageService;
    private ImageUploadProperties properties;

    @BeforeEach
    void setUp() {
        properties = new ImageUploadProperties();
        properties.setStoragePath(uploadDir.toString());
        imageStorageService = new ImageStorageService(properties);
    }

    @Test
    @DisplayName("store should write image under the authenticated user's directory")
    void store_ShouldWriteImageUnderUserDirectory() {
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
    @DisplayName("store should detect jpeg content from file signature")
    void store_ShouldDetectJpegContentFromSignature() {
        UUID userId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile("file", "rash.jpeg", "application/octet-stream", JPEG_BYTES);

        ImageUploadResponse response = imageStorageService.store(userId, file);
        StoredImageResource storedImage = imageStorageService.load(userId, response.getFileName());

        assertTrue(response.getFileName().endsWith(".jpg"));
        assertEquals("image/jpeg", response.getContentType());
        assertEquals("image/jpeg", storedImage.contentType());
        assertEquals(JPEG_BYTES.length, storedImage.contentLength());
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
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "note.txt",
                "text/plain",
                "not an image".getBytes(StandardCharsets.UTF_8));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> imageStorageService.store(userId, file));

        assertEquals("Only JPEG and PNG images are allowed.", exception.getMessage());
    }

    @Test
    @DisplayName("store should reject missing and empty files")
    void store_ShouldRejectMissingAndEmptyFiles() {
        UUID userId = UUID.randomUUID();
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.png", "image/png", new byte[0]);

        IllegalArgumentException nullException = assertThrows(
                IllegalArgumentException.class,
                () -> imageStorageService.store(userId, null));
        IllegalArgumentException emptyException = assertThrows(
                IllegalArgumentException.class,
                () -> imageStorageService.store(userId, emptyFile));

        assertEquals("Image file is required.", nullException.getMessage());
        assertEquals("Image file is required.", emptyException.getMessage());
    }

    @Test
    @DisplayName("store should reject files above the configured size limit")
    void store_ShouldRejectFilesAboveConfiguredSizeLimit() {
        UUID userId = UUID.randomUUID();
        properties.setMaxFileSizeBytes(PNG_BYTES.length - 1);
        MockMultipartFile file = new MockMultipartFile("file", "rash.png", "image/png", PNG_BYTES);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> imageStorageService.store(userId, file));

        assertEquals("Image file must be 5MB or smaller.", exception.getMessage());
    }

    @Test
    @DisplayName("store should reject valid signatures when content type is not allowed")
    void store_ShouldRejectDisallowedConfiguredContentType() {
        UUID userId = UUID.randomUUID();
        properties.setAllowedContentTypes(List.of("image/jpeg"));
        MockMultipartFile file = new MockMultipartFile("file", "rash.png", "image/png", PNG_BYTES);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> imageStorageService.store(userId, file));

        assertEquals("Only JPEG and PNG images are allowed.", exception.getMessage());
    }

    @Test
    @DisplayName("store should reject incomplete or malformed image signatures")
    void store_ShouldRejectMalformedImageSignatures() {
        UUID userId = UUID.randomUUID();

        List<MockMultipartFile> malformedFiles = List.of(
                new MockMultipartFile("file", "short.png", "image/png", new byte[] { 0x01, 0x02 }),
                new MockMultipartFile("file", "bad-first-byte.jpg", "image/jpeg",
                        new byte[] { 0x00, (byte) 0xD8, (byte) 0xFF }),
                new MockMultipartFile("file", "bad-second-byte.jpg", "image/jpeg",
                        new byte[] { (byte) 0xFF, 0x00, (byte) 0xFF }),
                new MockMultipartFile("file", "bad-third-byte.jpg", "image/jpeg",
                        new byte[] { (byte) 0xFF, (byte) 0xD8, 0x00 }));

        for (MockMultipartFile file : malformedFiles) {
            IllegalArgumentException exception = assertThrows(
                    IllegalArgumentException.class,
                    () -> imageStorageService.store(userId, file));
            assertEquals("Only JPEG and PNG images are allowed.", exception.getMessage());
        }
    }

    @Test
    @DisplayName("store should wrap multipart read failures")
    void store_ShouldWrapMultipartReadFailures() {
        UUID userId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile("file", "rash.png", "image/png", PNG_BYTES) {
            @Override
            public byte @NonNull [] getBytes() throws IOException {
                throw new IOException("read failed");
            }
        };

        assertThrows(UncheckedIOException.class, () -> imageStorageService.store(userId, file));
    }

    @Test
    @DisplayName("load should reject invalid stored file names")
    void load_ShouldRejectInvalidStoredFileNames() {
        UUID userId = UUID.randomUUID();

        assertThrows(ResourceNotFoundException.class, () -> imageStorageService.load(userId, "../image.png"));
        assertThrows(ResourceNotFoundException.class, () -> imageStorageService.load(userId, "not-a-uuid.png"));
        assertThrows(ResourceNotFoundException.class, () -> imageStorageService.load(userId, "bad\u0000name.png"));
    }

    @Test
    @DisplayName("load should reject a missing valid stored file name")
    void load_ShouldRejectMissingValidStoredFileName() {
        UUID userId = UUID.randomUUID();
        String fileName = UUID.randomUUID() + ".jpg";

        assertThrows(ResourceNotFoundException.class, () -> imageStorageService.load(userId, fileName));
    }

    @Test
    @DisplayName("delete should remove current user's image and ignore already deleted files")
    void delete_ShouldRemoveCurrentUsersImageAndIgnoreMissingFiles() {
        UUID userId = UUID.randomUUID();
        ImageUploadResponse response = imageStorageService.store(
                userId,
                new MockMultipartFile("file", "rash.png", "image/png", PNG_BYTES));
        Path storedPath = uploadDir.resolve(userId.toString()).resolve(response.getFileName());

        imageStorageService.delete(userId, response.getFileName());
        imageStorageService.delete(userId, response.getFileName());

        assertFalse(Files.exists(storedPath));
    }
}
