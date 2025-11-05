package de.dermatrack.backend.diary.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

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
public class DiaryEntry {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "UUID DEFAULT gen_random_uuid()")
    private UUID id;

    @Column(
            name = "created_at",
            nullable = false,
            columnDefinition = "TIMESTAMP WITH TIME ZONE DEFAULT now()"
    )
    private OffsetDateTime createdAt;

    @Column(name = "allergies")
    @Min(value = 0, message = "Allergies rating must be 0 or higher")
    @Max(value = 10, message = "Allergies rating must be 10 or lower")
    private Integer allergies;

    @Column(name = "infections")
    @Min(value = 0, message = "Infections rating must be 0 or higher")
    @Max(value = 10, message = "Infections rating must be 10 or lower")
    private Integer infections;

    @Column(name = "stress_level")
    @Min(value = 0, message = "Stress level must be 0 or higher")
    @Max(value = 10, message = "Stress level must be 10 or lower")
    private Integer stressLevel;

    @Column(name = "sleep")
    @Min(value = 0, message = "Sleep rating must be 0 or higher")
    @Max(value = 10, message = "Sleep rating must be 10 or lower")
    private Integer sleep;

    @Column(name = "nutrition")
    @Min(value = 0, message = "Nutrition rating must be 0 or higher")
    @Max(value = 10, message = "Nutrition rating must be 10 or lower")
    private Integer nutrition;

    @Column(name = "symptoms")
    @Min(value = 0, message = "Symptoms rating must be 0 or higher")
    @Max(value = 10, message = "Symptoms rating must be 10 or lower")
    private Integer symptoms;

    @Column(name = "miscellaneous", columnDefinition = "TEXT")
    private String miscellaneous;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}