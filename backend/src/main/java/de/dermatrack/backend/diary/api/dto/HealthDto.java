package de.dermatrack.backend.diary.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthDto {

    private Boolean otherAllergies;
    private String otherAllergiesNotes;
    private Boolean infections;
    private String infectionsNotes;
}
