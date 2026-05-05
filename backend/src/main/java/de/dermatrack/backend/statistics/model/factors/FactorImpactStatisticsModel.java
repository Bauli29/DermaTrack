package de.dermatrack.backend.statistics.model.factors;

import java.util.List;

import de.dermatrack.backend.statistics.model.common.StatisticsDataQualityModel;
import de.dermatrack.backend.statistics.model.common.StatisticsDateRangeModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FactorImpactStatisticsModel {

    private StatisticsDateRangeModel dateRange;
    private int totalEntries;
    private Double averageWeightedSymptomScore;
    private StatisticsDataQualityModel dataQuality;
    private List<FactorImpactModel> factors;
}
