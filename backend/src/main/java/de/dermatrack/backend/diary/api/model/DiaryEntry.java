package de.dermatrack.backend.diary.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "diary_entry",
    indexes = {
        @Index(name = "DiaryEntry_Created_at_idx", columnList = "created_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Diary entry capturing daily ratings and notes")
public class DiaryEntry {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID DEFAULT gen_random_uuid()")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Unique identifier of the diary entry", example = "c56a4180-65aa-42ec-a945-5fd21dec0538", accessMode = Schema.AccessMode.READ_ONLY)
    private UUID id;

    @Column(
            name = "created_at",
            nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT now()"
    )
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Creation timestamp (UTC)", example = "2025-11-23T11:56:26.958Z", type = "string", format = "date-time", accessMode = Schema.AccessMode.READ_ONLY)
    private OffsetDateTime createdAt;

    @Column(name = "allergies")
    @Min(value = 0, message = "Allergies rating must be 0 or higher")
    @Max(value = 10, message = "Allergies rating must be 10 or lower")
    @Schema(description = "Allergies rating (0-10)", example = "0")
    private Integer allergies;

    @Column(name = "infections")
    @Min(value = 0, message = "Infections rating must be 0 or higher")
    @Max(value = 10, message = "Infections rating must be 10 or lower")
    @Schema(description = "Infections rating (0-10)", example = "0")
    private Integer infections;

    @Column(name = "stress_level")
    @Min(value = 0, message = "Stress level must be 0 or higher")
    @Max(value = 10, message = "Stress level must be 10 or lower")
    @Schema(description = "Stress level rating (0-10)", example = "5")
    private Integer stressLevel;

    @Column(name = "sleep")
    @Min(value = 0, message = "Sleep rating must be 0 or higher")
    @Max(value = 10, message = "Sleep rating must be 10 or lower")
    @Schema(description = "Sleep quality rating (0-10)", example = "7")
    private Integer sleep;

    @Column(name = "nutrition")
    @Min(value = 0, message = "Nutrition rating must be 0 or higher")
    @Max(value = 10, message = "Nutrition rating must be 10 or lower")
    @Schema(description = "Nutrition rating (0-10)", example = "6")
    private Integer nutrition;

    @Column(name = "symptoms")
    @Min(value = 0, message = "Symptoms rating must be 0 or higher")
    @Max(value = 10, message = "Symptoms rating must be 10 or lower")
    @Schema(description = "Symptoms severity rating (0-10)", example = "3")
    private Integer symptoms;

    @Column(name = "miscellaneous", columnDefinition = "TEXT")
    @Schema(description = "Free text notes / miscellaneous information", example = "Today was a good day")
    private String miscellaneous;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}