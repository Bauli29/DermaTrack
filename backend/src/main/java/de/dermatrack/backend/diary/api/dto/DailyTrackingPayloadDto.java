package de.dermatrack.backend.diary.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Structured daily tracking payload")
public class DailyTrackingPayloadDto {

    @Valid
    private PsycheDto psyche;

    @Valid
    private ContactFactorsDto contactFactors;

    @Valid
    private NutritionDto nutrition;

    @Valid
    private CareProductsDto careProducts;

    @Valid
    private HealthDto health;

    @Valid
    private SymptomsDto symptoms;
}