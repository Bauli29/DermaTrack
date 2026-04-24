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

    private String otherAllergies;
    private String infections;
}
