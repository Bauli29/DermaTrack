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
public class ContactFactorsDto {

    private Boolean shower;
    private String showerNotes;
    private Boolean clothing;
    private String clothingNotes;
    private Boolean animalContact;
    private String animalContactNotes;
    private List<String> customContactFactors;
}
