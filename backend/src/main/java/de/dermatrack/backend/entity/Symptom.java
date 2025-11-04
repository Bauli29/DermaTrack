package de.dermatrack.backend.entity;

import de.dermatrack.backend.base.Auditable;
import java.util.UUID;

public class Symptom extends Auditable {
    private UUID id;
    private String name;
    private String description;
    private boolean isCustom;

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isCustom() {
        return isCustom;
    }

    public void setCustom(boolean custom) {
        isCustom = custom;
    }
}