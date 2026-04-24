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

    private String skinCare;
    private String hairProducts;
    private String soapShampoo;
    private String cosmetics;
    private List<String> customCareProducts;
}
