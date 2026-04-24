package de.dermatrack.backend.diary.api.dto;

import java.util.List;

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
public class SymptomsDto {

    @Min(0)
    @Max(10)
    private Integer itchiness;

    private Boolean scratch;

    @Min(0)
    @Max(10)
    private Integer inflammation;

    @Min(0)
    @Max(10)
    private Integer dryness;

    private Boolean weepingSkin;
    private Boolean skinCracks;
    private List<String> spreadPhotoUrls;
}
