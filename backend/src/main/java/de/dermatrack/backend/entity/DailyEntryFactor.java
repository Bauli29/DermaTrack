package de.dermatrack.backend.entity;

import de.dermatrack.backend.base.Auditable;
import java.util.UUID;

public class DailyEntryFactor extends Auditable {
    private UUID id;
    private int value;
    private String unit;
    private String note;

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}