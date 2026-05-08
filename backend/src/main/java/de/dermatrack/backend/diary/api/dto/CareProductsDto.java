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
public class CareProductsDto {

    private Boolean skinCare;
    private String skinCareNotes;
    private Boolean hairProducts;
    private String hairProductsNotes;
    private Boolean soapShampoo;
    private String soapShampooNotes;
    private Boolean cosmetics;
    private String cosmeticsNotes;
    private List<String> customCareProducts;
}
