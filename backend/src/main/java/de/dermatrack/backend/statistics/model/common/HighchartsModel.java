package de.dermatrack.backend.statistics.model.common;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HighchartsModel {

    private String chartType;
    private List<String> categories;
    private List<HighchartsSeriesModel> series;
    private StatisticsDateRangeModel dateRange;
}
