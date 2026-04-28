package de.dermatrack.backend.diary.api.dto;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for updating a diary entry")
public class DiaryEntryUpdateRequest {

    @NotNull
    @Schema(description = "Business date of this daily tracking entry", example = "2026-04-23")
    private LocalDate entryDate;

    @NotNull
    @Valid
    private DailyTrackingPayloadDto tracking;

    @Schema(description = "Optional notes for the diary entry", example = "Felt better after applying cream")
    private String notes;

    // Explicit accessors keep mapper compatibility even if Lombok tooling is stale.
    public LocalDate getEntryDate() {
        return entryDate;
    }

    public DailyTrackingPayloadDto getTracking() {
        return tracking;
    }

    public String getNotes() {
        return notes;
    }
}
