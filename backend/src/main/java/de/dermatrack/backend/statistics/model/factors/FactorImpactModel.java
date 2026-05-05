package de.dermatrack.backend.statistics.model.factors;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FactorImpactModel {

    private String key;
    private String label;
    private String category;
    private int totalEntries;
    private int occurrenceCount;
    private double occurrenceRate;
    private Double averageWeightedSymptomScore;
    private Double weightedSymptomDelta;
    private Double pearsonCorrelation;
}
