package de.dermatrack.backend.diary.api.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Diary entry response payload")
public class DiaryEntryResponse {

    private UUID id;
    private UUID userId;
    private OffsetDateTime createdAt;

    private Integer allergies;
    private Integer infections;
    private Integer stressLevel;
    private Integer sleep;
    private Integer nutrition;
    private Integer symptoms;

    private String miscellaneous;
}
