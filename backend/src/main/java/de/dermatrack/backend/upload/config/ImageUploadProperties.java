package de.dermatrack.backend.upload.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "app.uploads.images")
@Validated
@Getter
@Setter
public class ImageUploadProperties {

    @NotBlank
    private String storagePath = "uploads/images";

    @Positive
    private long maxFileSizeBytes = 5L * 1024L * 1024L;

    @NotEmpty
    private List<String> allowedContentTypes = List.of("image/jpeg", "image/png");
}
