package de.dermatrack.backend.diary.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating a diary entry")
public class DiaryEntryCreateRequest {

    @Min(value = 0, message = "Allergies rating must be 0 or higher")
    @Max(value = 10, message = "Allergies rating must be 10 or lower")
    private Integer allergies;

    @Min(value = 0, message = "Infections rating must be 0 or higher")
    @Max(value = 10, message = "Infections rating must be 10 or lower")
    private Integer infections;

    @Min(value = 0, message = "Stress level must be 0 or higher")
    @Max(value = 10, message = "Stress level must be 10 or lower")
    private Integer stressLevel;

    @Min(value = 0, message = "Sleep rating must be 0 or higher")
    @Max(value = 10, message = "Sleep rating must be 10 or lower")
    private Integer sleep;

    @Min(value = 0, message = "Nutrition rating must be 0 or higher")
    @Max(value = 10, message = "Nutrition rating must be 10 or lower")
    private Integer nutrition;

    @Min(value = 0, message = "Symptoms rating must be 0 or higher")
    @Max(value = 10, message = "Symptoms rating must be 10 or lower")
    private Integer symptoms;

    private String miscellaneous;
}
