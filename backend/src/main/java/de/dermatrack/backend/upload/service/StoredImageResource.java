package de.dermatrack.backend.upload.service;

import org.springframework.core.io.Resource;

public record StoredImageResource(Resource resource, String contentType, long contentLength) {
}
