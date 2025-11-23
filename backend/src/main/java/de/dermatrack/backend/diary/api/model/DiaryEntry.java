package de.dermatrack.backend.diary.api.model;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import de.dermatrack.backend.auth.api.model.AppUser;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "diary_entry", indexes = {
        @Index(name = "idx_diary_entry_created_at", columnList = "created_at"),
        @Index(name = "idx_diary_entry_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Diary entry capturing daily ratings and notes")
public class DiaryEntry {

    @Id
    @UuidGenerator
    @Column(name = "id", updatable = false, nullable = false)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Schema(description = "Unique identifier of the diary entry", example = "c56a4180-65aa-42ec-a945-5fd21dec0538", accessMode = Schema.AccessMode.READ_ONLY)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_diary_entry_user"))
    @Schema(description = "Owner user of this diary entry")
    private AppUser user;

    @Column(name = "created_at", nullable = false, updatable = false)
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

    @JsonProperty("userId")
    @Schema(description = "ID of the user who owns this entry", example = "c56a4180-65aa-42ec-a945-5fd21dec0538")
    public UUID getUserId() {
        return user != null ? user.getId() : null;
    }
}