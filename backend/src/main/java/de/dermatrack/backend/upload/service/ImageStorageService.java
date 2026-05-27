package de.dermatrack.backend.upload.service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import de.dermatrack.backend.exception.ResourceNotFoundException;
import de.dermatrack.backend.upload.api.dto.ImageUploadResponse;
import de.dermatrack.backend.upload.config.ImageUploadProperties;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageStorageService {

    private static final String IMAGE_RESOURCE = "Image";
    private static final Pattern STORED_FILE_NAME_PATTERN = Pattern
            .compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\.(jpg|png)$");
    private static final byte[] PNG_SIGNATURE = new byte[] {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    };

    private final ImageUploadProperties properties;

    public ImageUploadResponse store(UUID userId, MultipartFile file) {
        byte[] bytes = readAndValidateFile(file);
        String contentType = detectContentType(bytes);
        String fileName = UUID.randomUUID() + extensionForContentType(contentType);
        Path target = resolveUserDirectory(userId).resolve(fileName).normalize();

        try {
            Files.createDirectories(target.getParent());
            Files.write(target, bytes, StandardOpenOption.CREATE_NEW);
        } catch (IOException ex) {
            throw new UncheckedIOException("Could not store uploaded image", ex);
        }

        return new ImageUploadResponse(
                "/api/uploads/images/" + fileName,
                fileName,
                contentType,
                bytes.length);
    }

    public StoredImageResource load(UUID userId, String fileName) {
        String sanitizedFileName = sanitizeStoredFileName(fileName);
        Path target = resolveUserDirectory(userId).resolve(sanitizedFileName).normalize();

        if (!isPathInsideUserDirectory(userId, target) || !Files.isRegularFile(target)) {
            throw new ResourceNotFoundException(IMAGE_RESOURCE, "fileName", fileName);
        }

        try {
            Resource resource = new UrlResource(target.toUri());
            return new StoredImageResource(
                    resource,
                    contentTypeForFileName(sanitizedFileName),
                    Files.size(target));
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException(IMAGE_RESOURCE, "fileName", fileName);
        } catch (IOException ex) {
            throw new UncheckedIOException("Could not read stored image", ex);
        }
    }

    public void delete(UUID userId, String fileName) {
        String sanitizedFileName = sanitizeStoredFileName(fileName);
        Path target = resolveUserDirectory(userId).resolve(sanitizedFileName).normalize();

        if (!isPathInsideUserDirectory(userId, target)) {
            throw new ResourceNotFoundException(IMAGE_RESOURCE, "fileName", fileName);
        }

        try {
            Files.deleteIfExists(target);
        } catch (IOException ex) {
            throw new UncheckedIOException("Could not delete stored image", ex);
        }
    }

    private byte[] readAndValidateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required.");
        }

        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw new IllegalArgumentException("Image file must be 5MB or smaller.");
        }

        try {
            byte[] bytes = file.getBytes();
            detectContentType(bytes);
            return bytes;
        } catch (IOException ex) {
            throw new UncheckedIOException("Could not read uploaded image", ex);
        }
    }

    private String detectContentType(byte[] bytes) {
        String detectedType;

        if (isPng(bytes)) {
            detectedType = "image/png";
        } else if (isJpeg(bytes)) {
            detectedType = "image/jpeg";
        } else {
            throw new IllegalArgumentException("Only JPEG and PNG images are allowed.");
        }

        Set<String> allowedContentTypes = Set.copyOf(properties.getAllowedContentTypes());
        if (!allowedContentTypes.contains(detectedType)) {
            throw new IllegalArgumentException("Only JPEG and PNG images are allowed.");
        }

        return detectedType;
    }

    private boolean isJpeg(byte[] bytes) {
        return bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF;
    }

    private boolean isPng(byte[] bytes) {
        if (bytes.length < PNG_SIGNATURE.length) {
            return false;
        }

        for (int i = 0; i < PNG_SIGNATURE.length; i++) {
            if (bytes[i] != PNG_SIGNATURE[i]) {
                return false;
            }
        }

        return true;
    }

    private String extensionForContentType(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/jpeg" -> ".jpg";
            default -> throw new IllegalArgumentException("Unsupported image type.");
        };
    }

    private String contentTypeForFileName(String fileName) {
        return fileName.toLowerCase(Locale.ROOT).endsWith(".png") ? "image/png" : "image/jpeg";
    }

    private Path resolveRootDirectory() {
        return Path.of(properties.getStoragePath()).toAbsolutePath().normalize();
    }

    private Path resolveUserDirectory(UUID userId) {
        return resolveRootDirectory().resolve(userId.toString()).normalize();
    }

    private boolean isPathInsideUserDirectory(UUID userId, Path path) {
        return path.normalize().startsWith(resolveUserDirectory(userId));
    }

    private String sanitizeStoredFileName(String fileName) {
        try {
            String sanitized = Path.of(fileName).getFileName().toString();

            if (!sanitized.equals(fileName) || !STORED_FILE_NAME_PATTERN.matcher(sanitized).matches()) {
                throw new ResourceNotFoundException(IMAGE_RESOURCE, "fileName", fileName);
            }

            return sanitized;
        } catch (InvalidPathException ex) {
            throw new ResourceNotFoundException(IMAGE_RESOURCE, "fileName", fileName);
        }
    }
}
