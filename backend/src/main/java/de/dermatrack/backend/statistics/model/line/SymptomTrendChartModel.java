package de.dermatrack.backend.statistics.model.line;

import java.util.List;

import de.dermatrack.backend.statistics.model.common.HighchartsSeriesModel;
import de.dermatrack.backend.statistics.model.common.StatisticsDateRangeModel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SymptomTrendChartModel {

    private String chartType;
    private List<String> categories;
    private List<HighchartsSeriesModel> series;
    private StatisticsDateRangeModel dateRange;
}
