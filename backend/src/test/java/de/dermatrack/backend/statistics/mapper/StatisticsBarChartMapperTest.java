package de.dermatrack.backend.statistics.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.statistics.model.common.HighchartsModel;
import de.dermatrack.backend.statistics.support.StatisticsTestDataFactory;

@DisplayName("StatisticsBarChartMapper Unit Tests")
class StatisticsBarChartMapperTest {

    private final StatisticsBarChartMapper mapper = new StatisticsBarChartMapper();

    @Test
    @DisplayName("toHighchartsModel() should create 7-day column chart with symptom series")
    void toSymptomTrendChart_ShouldBuildSevenDayColumnSeries() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        DiaryEntry firstDay = StatisticsTestDataFactory.buildEntryForBarChart(fromDate, 4, 2, 3, true, false, false);
        DiaryEntry thirdDay = StatisticsTestDataFactory.buildEntryForBarChart(fromDate.plusDays(2), 8, 4, 6, true, true, false);

        HighchartsModel chart = mapper.toHighchartsModel(List.of(firstDay, thirdDay), fromDate, endDate);

        assertThat(chart.getChartType()).isEqualTo("column");
        assertThat(chart.getCategories()).hasSize(7);
        assertThat(chart.getSeries()).hasSize(3);

        assertThat(chart.getSeries().get(0).getName()).isEqualTo("Itchiness");
        assertThat(chart.getSeries().get(0).getData().get(0)).isEqualTo(4.0);
        assertThat(chart.getSeries().get(0).getData().get(1)).isNull();
        assertThat(chart.getSeries().get(0).getData().get(2)).isEqualTo(8.0);

        assertThat(chart.getSeries().get(1).getName()).isEqualTo("Dryness");
        assertThat(chart.getSeries().get(2).getName()).isEqualTo("Inflammation");
        assertThat(chart.getDateRange().getFrom()).isEqualTo(fromDate);
        assertThat(chart.getDateRange().getTo()).isEqualTo(endDate);
    }
}
