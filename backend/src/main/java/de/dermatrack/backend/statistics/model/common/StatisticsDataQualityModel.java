package de.dermatrack.backend.statistics.model.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDataQualityModel {

    private int dataPointCount;
    private int minimumRecommendedDataPoints;
    private boolean insufficientData;
}
