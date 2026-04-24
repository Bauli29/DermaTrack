package de.dermatrack.backend.diary.api.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NutritionDto {

    private String nuts;
    private String fruits;
    private String shellfish;
    private String dairy;
    private String gluten;
    private List<String> customNutritionFactors;
}
