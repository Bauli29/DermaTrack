package de.dermatrack.backend.statistics.mapper;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.statistics.model.common.HighchartsSeriesModel;
import de.dermatrack.backend.statistics.model.common.StatisticsDataQuality;
import de.dermatrack.backend.statistics.model.common.StatisticsDateRangeModel;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StatisticsBarChartMapper {
        public SymptomTrendChartModel toSymptomTrendChart(List<DiaryEntry> entries, LocalDate fromDate,
            LocalDate toDate) {
        Map<LocalDate, DiaryEntry> entriesByDate = new HashMap<>();
        for (DiaryEntry entry : entries) {
            entriesByDate.put(entry.getEntryDate(), entry);
        }

        List<String> categories = new ArrayList<>();
        List<Double> itchiness = new ArrayList<>();
        List<Double> dryness = new ArrayList<>();
        List<Double> inflammation = new ArrayList<>();

        LocalDate current = fromDate;
        while (!current.isAfter(toDate)) {
            categories.add(current.toString());
            DiaryEntry entry = entriesByDate.get(current);

            itchiness.add(intToDouble(entry == null ? null : entry.getSymptomItchiness()));
            dryness.add(intToDouble(entry == null ? null : entry.getSymptomDryness()));
            inflammation.add(intToDouble(entry == null ? null : entry.getSymptomInflammation()));

            current = current.plusDays(1);
        }

        List<HighchartsSeriesModel> series = List.of(
                new HighchartsSeriesModel("Itchiness", itchiness),
                new HighchartsSeriesModel("Dryness", dryness),
                new HighchartsSeriesModel("Inflammation", inflammation)
            );

        return new SymptomTrendChartModel(
                "column",
                categories,
                series,
                new StatisticsDateRangeModel(fromDate, toDate),
                StatisticsDataQuality.fromEntries(entries));
    }

    private Double intToDouble(Integer value) {
        return value == null ? null : value.doubleValue();
    }
}
