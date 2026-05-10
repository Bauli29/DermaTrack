package de.dermatrack.backend.statistics.mapper;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.statistics.model.common.HighchartsModel;
import de.dermatrack.backend.statistics.model.common.HighchartsSeriesModel;
import de.dermatrack.backend.statistics.model.common.StatisticsDateRangeModel;
import de.dermatrack.backend.statistics.service.IWeightedSymptomCalculator;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StatisticsLineChartMapper {

    private final IWeightedSymptomCalculator weightedSymptomCalculator;

    public HighchartsModel toHighchartsModel(List<DiaryEntry> entries, LocalDate fromDate,
            LocalDate toDate) {
        Map<LocalDate, DiaryEntry> entriesByDate = new HashMap<>();
        for (DiaryEntry entry : entries) {
            entriesByDate.put(entry.getEntryDate(), entry);
        }

        List<String> categories = new ArrayList<>();
        List<Double> itchiness = new ArrayList<>();
        List<Double> dryness = new ArrayList<>();
        List<Double> inflammation = new ArrayList<>();
        List<Double> weightedSymptoms = new ArrayList<>();

        LocalDate current = fromDate;
        while (!current.isAfter(toDate)) {
            categories.add(current.toString());
            DiaryEntry entry = entriesByDate.get(current);

            itchiness.add(intToDouble(entry == null ? null : entry.getMentalStrain()));
            dryness.add(intToDouble(entry == null ? null : entry.getStressLevel()));
            inflammation.add(intToDouble(entry == null ? null : entry.getSleep()));
            weightedSymptoms.add(entry == null ? null : weightedSymptomCalculator.calculateSymptomWeight(entry));

            current = current.plusDays(1);
        }

        List<HighchartsSeriesModel> series = List.of(
                new HighchartsSeriesModel("Mental Strain", itchiness),
                new HighchartsSeriesModel("Stress Level", dryness),
                new HighchartsSeriesModel("Sleep", inflammation),
                new HighchartsSeriesModel("Weighted Symptoms", weightedSymptoms));

        return new HighchartsModel(
                "line",
                categories,
                series,
                new StatisticsDateRangeModel(fromDate, toDate));
    }

    private Double intToDouble(Integer value) {
        return value == null ? null : value.doubleValue();
    }
}
