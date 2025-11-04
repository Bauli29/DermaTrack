package de.dermatrack.backend.entity;

import de.dermatrack.backend.base.Auditable;
import java.time.LocalDate;
import java.util.UUID;

public class DailyEntry extends Auditable {
    private UUID id;
    private LocalDate date;
    private String notes;
    private int timezoneOffset;
    private boolean isDraft;

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public int getTimezoneOffset() {
        return timezoneOffset;
    }

    public void setTimezoneOffset(int timezoneOffset) {
        this.timezoneOffset = timezoneOffset;
    }

    public boolean isDraft() {
        return isDraft;
    }

    public void setDraft(boolean draft) {
        isDraft = draft;
    }
}