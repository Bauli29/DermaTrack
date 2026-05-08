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

    private Boolean nuts;
    private String nutsNotes;
    private Boolean fruits;
    private String fruitsNotes;
    private Boolean shellfish;
    private String shellfishNotes;
    private Boolean dairy;
    private String dairyNotes;
    private Boolean gluten;
    private String glutenNotes;
    private List<String> customNutritionFactors;
}
