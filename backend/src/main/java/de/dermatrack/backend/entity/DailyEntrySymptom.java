package de.dermatrack.backend.entity;

import de.dermatrack.backend.base.Auditable;
import de.dermatrack.backend.enums.SeverityScale;
import java.util.UUID;

public class DailyEntrySymptom extends Auditable {
    private UUID id;
    private int severity;
    private SeverityScale scale;
    private String note;

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public int getSeverity() {
        return severity;
    }

    public void setSeverity(int severity) {
        this.severity = severity;
    }

    public SeverityScale getScale() {
        return scale;
    }

    public void setScale(SeverityScale scale) {
        this.scale = scale;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}