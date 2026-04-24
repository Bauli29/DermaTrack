package de.dermatrack.backend.diary.api.dto;

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
public class PsycheDto {

    @Min(0)
    @Max(10)
    private Integer stressLevel;

    @Min(0)
    @Max(10)
    private Integer sleep;

    @Min(0)
    @Max(10)
    private Integer mentalStrain;
}
