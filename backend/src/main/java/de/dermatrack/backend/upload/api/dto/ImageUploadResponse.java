package de.dermatrack.backend.upload.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadResponse {

    private String url;
    private String fileName;
    private String contentType;
    private long size;
}
