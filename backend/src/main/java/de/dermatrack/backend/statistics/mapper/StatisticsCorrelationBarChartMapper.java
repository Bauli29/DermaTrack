package de.dermatrack.backend.statistics.mapper;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.exception.NotEnoughDataForCorrelationException;
import de.dermatrack.backend.statistics.model.common.HighchartsSeriesModel;
import de.dermatrack.backend.statistics.model.common.StatisticsDateRangeModel;
import de.dermatrack.backend.statistics.model.common.StatisticsMainCategory;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;
import de.dermatrack.backend.statistics.service.ICorrelationCalculator;
import de.dermatrack.backend.statistics.service.IWeightedSymptomCalculator;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StatisticsCorrelationBarChartMapper {
    private final ICorrelationCalculator correlationCalculator;
    private final IWeightedSymptomCalculator weightedSymptomCalculator;

    public SymptomTrendChartModel toSymptomTrendChart(List<DiaryEntry> entries, LocalDate fromDate,
            LocalDate toDate, StatisticsMainCategory mainCategory) {
        List<DiaryEntry> safeEntries = entries == null ? List.of() : entries;
        validateEnoughData(safeEntries, fromDate, toDate);

        List<Double> weightedSymptoms = new ArrayList<>();
        for (DiaryEntry entry : safeEntries) {
            weightedSymptoms.add(weightedSymptomCalculator.calculateSymptomWeight(entry));
        }

        List<String> categories = new ArrayList<>();
        List<Double> correlationValues = new ArrayList<>();

        for (StatisticsMainCategory.CorrelationSubcategory subcategory : mainCategory.getFixedSubcategories()) {
            List<Double> subcategoryValues = new ArrayList<>();
            for (DiaryEntry entry : safeEntries) {
                subcategoryValues.add(subcategory.valueExtractor().apply(entry));
            }

            Double correlation = correlationCalculator.calculatePearsonCorrelation(subcategoryValues, weightedSymptoms);
            if (correlation != null) {
                categories.add(subcategory.name());
                correlationValues.add(correlation);
            }
        }

        List<HighchartsSeriesModel> series = List.of(
                new HighchartsSeriesModel("Correlation", correlationValues));

        return new SymptomTrendChartModel(
                "column",
                categories,
                series,
                new StatisticsDateRangeModel(fromDate, toDate));
    }

    private void validateEnoughData(List<DiaryEntry> entries, LocalDate fromDate, LocalDate toDate) {
        int minimumRequiredEntries = minimumRequiredEntries(fromDate, toDate);
        if (entries.size() < minimumRequiredEntries) {
            throw new NotEnoughDataForCorrelationException("Not enough Data for Correlation Calculation");
        }
    }

    private int minimumRequiredEntries(LocalDate fromDate, LocalDate toDate) {
        long days = ChronoUnit.DAYS.between(fromDate, toDate) + 1;
        if (days >= 365) {
            return 300;
        }
        if (days >= 90) {
            return 75;
        }
        if (days >= 30) {
            return 25;
        }
        return 7;
    }
}
