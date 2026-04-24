package de.dermatrack.backend.diary.api.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Diary entry response payload")
public class DiaryEntryResponse {

    private UUID id;
    private UUID userId;
    private OffsetDateTime createdAt;
    private LocalDate entryDate;

    private DailyTrackingPayloadDto tracking;
}
