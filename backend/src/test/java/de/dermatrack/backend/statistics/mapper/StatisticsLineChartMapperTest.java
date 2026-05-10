package de.dermatrack.backend.statistics.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.statistics.model.common.HighchartsModel;
import de.dermatrack.backend.statistics.service.impl.WeightedSymptomCalculator;
import de.dermatrack.backend.statistics.support.StatisticsTestDataFactory;

@DisplayName("StatisticsLineChartMapper Unit Tests")
class StatisticsLineChartMapperTest {

    private final StatisticsLineChartMapper mapper = new StatisticsLineChartMapper(new WeightedSymptomCalculator());

    @Test
    @DisplayName("toHighchartsModel() should create 7-day line chart with gaps for missing days")
    void toSymptomTrendChart_ShouldBuildSevenDaySeriesWithNullGaps() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        DiaryEntry firstDay = StatisticsTestDataFactory.buildEntryForLineChart(fromDate, 4, 2, 3);
        DiaryEntry thirdDay = StatisticsTestDataFactory.buildEntryForLineChart(fromDate.plusDays(2), 8, 4, 6);

        HighchartsModel chart = mapper.toHighchartsModel(List.of(firstDay, thirdDay), fromDate, endDate);

        assertThat(chart.getChartType()).isEqualTo("line");
        assertThat(chart.getCategories()).hasSize(7);
        assertThat(chart.getSeries()).hasSize(4);

        assertThat(chart.getSeries().get(0).getName()).isEqualTo("Mental Strain");
        assertThat(chart.getSeries().get(0).getData().get(0)).isEqualTo(4.0);
        assertThat(chart.getSeries().get(0).getData().get(1)).isNull();
        assertThat(chart.getSeries().get(0).getData().get(2)).isEqualTo(8.0);

        assertThat(chart.getSeries().get(2).getName()).isEqualTo("Sleep");
        assertThat(chart.getSeries().get(2).getData().get(0)).isEqualTo(3.0);
        assertThat(chart.getSeries().get(2).getData().get(1)).isNull();
        assertThat(chart.getSeries().get(2).getData().get(2)).isEqualTo(6.0);
    }
}
