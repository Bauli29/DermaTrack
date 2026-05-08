package de.dermatrack.backend.diary.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.UuidGenerator;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import de.dermatrack.backend.auth.model.AppUser;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Entity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "diary_entry", indexes = {
        @Index(name = "idx_diary_entry_created_at", columnList = "created_at"),
        @Index(name = "idx_diary_entry_user_id", columnList = "user_id"),
        @Index(name = "idx_diary_entry_entry_date", columnList = "entry_date"),
        @Index(name = "idx_diary_entry_user_entry_date", columnList = "user_id,entry_date")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_diary_entry_user_entry_date", columnNames = { "user_id", "entry_date" })
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

    @Column(name = "entry_date", nullable = false)
    @Schema(description = "Business date of this daily tracking entry", example = "2026-04-23")
    private LocalDate entryDate;

    @Column(name = "stress_level")
    @Min(value = 0, message = "Stress level must be 0 or higher")
    @Max(value = 10, message = "Stress level must be 10 or lower")
    private Integer stressLevel;

    @Column(name = "sleep")
    @Min(value = 0, message = "Sleep rating must be 0 or higher")
    @Max(value = 10, message = "Sleep rating must be 10 or lower")
    private Integer sleep;

    @Column(name = "mental_strain")
    @Min(value = 0, message = "Mental strain must be 0 or higher")
    @Max(value = 10, message = "Mental strain must be 10 or lower")
    private Integer mentalStrain;

    @Column(name = "contact_shower")
    private Boolean contactShower;

    @Column(name = "contact_shower_notes")
    private String contactShowerNotes;

    @Column(name = "contact_clothing")
    private Boolean contactClothing;

    @Column(name = "contact_clothing_notes")
    private String contactClothingNotes;

    @Column(name = "contact_animal")
    private Boolean contactAnimal;

    @Column(name = "contact_animal_notes")
    private String contactAnimalNotes;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "diary_entry_custom_contact", joinColumns = @JoinColumn(name = "diary_entry_id"))
    @Column(name = "factor")
    private List<String> customContactFactors = new ArrayList<>();

    @Column(name = "nutrition_nuts")
    private Boolean nutritionNuts;

    @Column(name = "nutrition_nuts_notes")
    private String nutritionNutsNotes;

    @Column(name = "nutrition_fruits")
    private Boolean nutritionFruits;

    @Column(name = "nutrition_fruits_notes")
    private String nutritionFruitsNotes;

    @Column(name = "nutrition_shellfish")
    private Boolean nutritionShellfish;

    @Column(name = "nutrition_shellfish_notes")
    private String nutritionShellfishNotes;

    @Column(name = "nutrition_dairy")
    private Boolean nutritionDairy;

    @Column(name = "nutrition_dairy_notes")
    private String nutritionDairyNotes;

    @Column(name = "nutrition_gluten")
    private Boolean nutritionGluten;

    @Column(name = "nutrition_gluten_notes")
    private String nutritionGlutenNotes;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "diary_entry_custom_nutrition", joinColumns = @JoinColumn(name = "diary_entry_id"))
    @Column(name = "factor")
    private List<String> customNutritionFactors = new ArrayList<>();

    @Column(name = "care_skin_care")
    private Boolean careSkinCare;

    @Column(name = "care_skin_care_notes")
    private String careSkinCareNotes;

    @Column(name = "care_hair_products")
    private Boolean careHairProducts;

    @Column(name = "care_hair_products_notes")
    private String careHairProductsNotes;

    @Column(name = "care_soapShampoo")
    private Boolean careSoapShampoo;

    @Column(name = "care_soapShampoo_notes")
    private String careSoapShampooNotes;

    @Column(name = "care_cosmetics")
    private Boolean careCosmetics;

    @Column(name = "care_cosmetics_notes")
    private String careCosmeticsNotes;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "diary_entry_custom_care", joinColumns = @JoinColumn(name = "diary_entry_id"))
    @Column(name = "product")
    private List<String> customCareProducts = new ArrayList<>();

    @Column(name = "health_other_allergies")
    private Boolean healthOtherAllergies;

    @Column(name = "health_other_allergies_notes")
    private String healthOtherAllergiesNotes;

    @Column(name = "health_infections")
    private Boolean healthInfections;

    @Column(name = "health_infections_notes")
    private String healthInfectionsNotes;

    @Column(name = "symptom_itchiness")
    @Min(value = 0, message = "Itchiness rating must be 0 or higher")
    @Max(value = 10, message = "Itchiness rating must be 10 or lower")
    private Integer symptomItchiness;

    @Column(name = "symptom_scratch")
    private Boolean symptomScratch;

    @Column(name = "symptom_inflammation")
    @Min(value = 0, message = "Inflammation rating must be 0 or higher")
    @Max(value = 10, message = "Inflammation rating must be 10 or lower")
    private Integer symptomInflammation;

    @Column(name = "symptom_dryness")
    @Min(value = 0, message = "Dryness rating must be 0 or higher")
    @Max(value = 10, message = "Dryness rating must be 10 or lower")
    private Integer symptomDryness;

    @Column(name = "symptom_weeping_skin")
    private Boolean symptomWeepingSkin;

    @Column(name = "symptom_skin_cracks")
    private Boolean symptomSkinCracks;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "diary_entry_spread_photo", joinColumns = @JoinColumn(name = "diary_entry_id"))
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private List<String> symptomSpreadPhotoUrls = new ArrayList<>();

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public void setCustomContactFactors(List<String> customContactFactors) {
        this.customContactFactors = customContactFactors == null ? new ArrayList<>()
                : new ArrayList<>(customContactFactors);
    }

    public void setCustomNutritionFactors(List<String> customNutritionFactors) {
        this.customNutritionFactors = customNutritionFactors == null ? new ArrayList<>()
                : new ArrayList<>(customNutritionFactors);
    }

    public void setCustomCareProducts(List<String> customCareProducts) {
        this.customCareProducts = customCareProducts == null ? new ArrayList<>() : new ArrayList<>(customCareProducts);
    }

    public void setSymptomSpreadPhotoUrls(List<String> symptomSpreadPhotoUrls) {
        this.symptomSpreadPhotoUrls = symptomSpreadPhotoUrls == null ? new ArrayList<>()
                : new ArrayList<>(symptomSpreadPhotoUrls);
    }

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