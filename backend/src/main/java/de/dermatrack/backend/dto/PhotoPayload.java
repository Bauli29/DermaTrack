package de.dermatrack.backend.dto;

import java.util.UUID;

public class PhotoPayload {
    private String url;
    private UUID bodyAreaId;

    // Getters and setters
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public UUID getBodyAreaId() {
        return bodyAreaId;
    }

    public void setBodyAreaId(UUID bodyAreaId) {
        this.bodyAreaId = bodyAreaId;
    }
}