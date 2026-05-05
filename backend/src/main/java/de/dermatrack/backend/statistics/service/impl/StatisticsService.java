package de.dermatrack.backend.statistics.service.impl;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;
import de.dermatrack.backend.statistics.mapper.StatisticsBarChartMapper;
import de.dermatrack.backend.statistics.mapper.StatisticsLineChartMapper;
import de.dermatrack.backend.statistics.model.common.StatisticsDataQuality;
import de.dermatrack.backend.statistics.model.common.StatisticsDateRangeModel;
import de.dermatrack.backend.statistics.model.common.StatisticsPeriod;
import de.dermatrack.backend.statistics.model.factors.FactorImpactModel;
import de.dermatrack.backend.statistics.model.factors.FactorImpactStatisticsModel;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;
import de.dermatrack.backend.statistics.service.ICorrelationCalculator;
import de.dermatrack.backend.statistics.service.IStatisticsService;
import de.dermatrack.backend.statistics.service.IWeightedSymptomCalculator;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService implements IStatisticsService {

    private final IDiaryEntryRepository diaryEntryRepository;
    private final StatisticsLineChartMapper statisticsLineChartMapper;
    private final StatisticsBarChartMapper statisticsBarChartMapper;
    private final IWeightedSymptomCalculator weightedSymptomCalculator;
    private final ICorrelationCalculator correlationCalculator;

    @Override
    public SymptomTrendChartModel getSymptomTrendLine(UUID userId, LocalDate fromDate, LocalDate endDate,
            StatisticsPeriod period) {
        return getTrend(userId, fromDate, endDate, period, statisticsLineChartMapper::toSymptomTrendChart);
    }

    @Override
    public SymptomTrendChartModel getSymptomTrendBar(UUID userId, LocalDate fromDate, LocalDate endDate,
            StatisticsPeriod period) {
        return getTrend(userId, fromDate, endDate, period, statisticsBarChartMapper::toSymptomTrendChart);
    }

    @Override
    public FactorImpactStatisticsModel getFactorImpacts(UUID userId, LocalDate fromDate, LocalDate endDate,
            StatisticsPeriod period) {
        StatisticsDateWindow dateWindow = resolveDateWindow(fromDate, endDate, period);
        List<DiaryEntry> entries = findEntriesInWindow(userId, dateWindow);
        List<Double> weightedScores = entries.stream()
                .map(weightedSymptomCalculator::calculateSymptomWeight)
                .toList();
        Double overallAverage = average(weightedScores);

        List<FactorImpactModel> factors = factorDefinitions().stream()
                .map(factor -> buildFactorImpact(factor, entries, weightedScores, overallAverage))
                .sorted(Comparator
                        .comparing(StatisticsService::absoluteCorrelation, Comparator.reverseOrder())
                        .thenComparing(StatisticsService::absoluteDelta, Comparator.reverseOrder())
                        .thenComparing(FactorImpactModel::getLabel))
                .toList();

        return new FactorImpactStatisticsModel(
                new StatisticsDateRangeModel(dateWindow.fromDate(), dateWindow.endDate()),
                entries.size(),
                overallAverage,
                StatisticsDataQuality.fromEntries(entries),
                factors);
    }

    private SymptomTrendChartModel getTrend(
            UUID userId,
            LocalDate fromDate,
            LocalDate endDate,
            StatisticsPeriod period,
            TrendChartMapper mapper) {
        StatisticsDateWindow dateWindow = resolveDateWindow(fromDate, endDate, period);
        List<DiaryEntry> entries = findEntriesInWindow(userId, dateWindow);

        return mapper.map(entries, dateWindow.fromDate(), dateWindow.endDate());
    }

    private StatisticsDateWindow resolveDateWindow(LocalDate fromDate, LocalDate endDate, StatisticsPeriod period) {
        LocalDate effectiveEndDate = endDate == null ? LocalDate.now() : endDate;
        if (fromDate != null) {
            if (fromDate.isAfter(effectiveEndDate)) {
                throw new IllegalArgumentException("fromDate must be on or before endDate");
            }

            return new StatisticsDateWindow(fromDate, effectiveEndDate);
        }

        StatisticsPeriod effectivePeriod = period == null ? StatisticsPeriod.LAST_30_DAYS : period;
        LocalDate effectiveFromDate = effectiveEndDate.minusDays(effectivePeriod.getDays() - 1L);
        return new StatisticsDateWindow(effectiveFromDate, effectiveEndDate);
    }

    private List<DiaryEntry> findEntriesInWindow(UUID userId, StatisticsDateWindow dateWindow) {
        return diaryEntryRepository
                .findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(
                        userId,
                        dateWindow.fromDate(),
                        dateWindow.endDate());
    }

    private FactorImpactModel buildFactorImpact(
            FactorDefinition factor,
            List<DiaryEntry> entries,
            List<Double> weightedScores,
            Double overallAverage) {
        List<Double> factorScores = entries.stream()
                .map(factor.scoreExtractor())
                .toList();
        List<Double> selectedWeightedScores = weightedScoresForSelectedEntries(factorScores, weightedScores);
        Double selectedAverage = average(selectedWeightedScores);
        Double delta = selectedAverage == null || overallAverage == null ? null : round(selectedAverage - overallAverage, 2);
        Double correlation = correlationCalculator.calculatePearsonCorrelation(factorScores, weightedScores);

        return new FactorImpactModel(
                factor.key(),
                factor.label(),
                factor.category(),
                entries.size(),
                selectedWeightedScores.size(),
                entries.isEmpty() ? 0.0 : round((selectedWeightedScores.size() * 100.0) / entries.size(), 1),
                selectedAverage,
                delta,
                correlation == null ? null : round(correlation, 3));
    }

    private List<Double> weightedScoresForSelectedEntries(List<Double> factorScores, List<Double> weightedScores) {
        return java.util.stream.IntStream.range(0, factorScores.size())
                .filter(index -> factorScores.get(index) != null && factorScores.get(index) > 0)
                .mapToObj(weightedScores::get)
                .toList();
    }

    private static Double average(List<Double> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }

        return round(values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0), 2);
    }

    private static Double absoluteCorrelation(FactorImpactModel factor) {
        return factor.getPearsonCorrelation() == null ? -1.0 : Math.abs(factor.getPearsonCorrelation());
    }

    private static Double absoluteDelta(FactorImpactModel factor) {
        return factor.getWeightedSymptomDelta() == null ? -1.0 : Math.abs(factor.getWeightedSymptomDelta());
    }

    private static double round(double value, int precision) {
        double factor = Math.pow(10, precision);
        return Math.round(value * factor) / factor;
    }

    private List<FactorDefinition> factorDefinitions() {
        return List.of(
                new FactorDefinition("contact.shower", "Shower", "Contact", entry -> showerScore(entry.getContactShower())),
                new FactorDefinition("contact.clothing", "Clothing", "Contact", entry -> clothingScore(entry.getContactClothing())),
                new FactorDefinition("contact.animal", "Animal contact", "Contact",
                        entry -> presenceScore(entry.getContactAnimal())),
                new FactorDefinition("nutrition.nuts", "Nuts", "Nutrition", entry -> intensityScore(entry.getNutritionNuts())),
                new FactorDefinition("nutrition.fruits", "Fruits", "Nutrition",
                        entry -> intensityScore(entry.getNutritionFruits())),
                new FactorDefinition("nutrition.shellfish", "Shellfish", "Nutrition",
                        entry -> intensityScore(entry.getNutritionShellfish())),
                new FactorDefinition("nutrition.dairy", "Dairy", "Nutrition", entry -> intensityScore(entry.getNutritionDairy())),
                new FactorDefinition("nutrition.gluten", "Gluten", "Nutrition",
                        entry -> intensityScore(entry.getNutritionGluten())),
                new FactorDefinition("care.skinCare", "Skin care", "Care", entry -> careScore(entry.getCareSkinCare())),
                new FactorDefinition("care.hairProducts", "Hair products", "Care",
                        entry -> careScore(entry.getCareHairProducts())),
                new FactorDefinition("care.soapShampoo", "Soap & shampoo", "Care",
                        entry -> careScore(entry.getCareSoapShampoo())),
                new FactorDefinition("care.cosmetics", "Cosmetics", "Care", entry -> careScore(entry.getCareCosmetics())),
                new FactorDefinition("health.allergies", "Other allergies", "Health",
                        entry -> presenceScore(entry.getHealthOtherAllergies())),
                new FactorDefinition("health.infections", "Infections", "Health",
                        entry -> presenceScore(entry.getHealthInfections())));
    }

    private static double presenceScore(String value) {
        if (value == null || value.isBlank() || "none".equalsIgnoreCase(value.trim())) {
            return 0.0;
        }

        return 1.0;
    }

    private static double intensityScore(String value) {
        if (value == null || value.isBlank()) {
            return 0.0;
        }

        return switch (value.trim().toLowerCase()) {
            case "none" -> 0.0;
            case "low" -> 1.0;
            case "medium" -> 2.0;
            case "high" -> 3.0;
            default -> 1.0;
        };
    }

    private static double careScore(String value) {
        if (value == null || value.isBlank()) {
            return 0.0;
        }

        return switch (value.trim().toLowerCase()) {
            case "none" -> 0.0;
            case "mild" -> 1.0;
            case "intense" -> 3.0;
            default -> 1.0;
        };
    }

    private static double showerScore(String value) {
        if (value == null || value.isBlank()) {
            return 0.0;
        }

        return switch (value.trim().toLowerCase()) {
            case "cold" -> 1.0;
            case "warm" -> 2.0;
            case "hot" -> 3.0;
            default -> presenceScore(value);
        };
    }

    private static double clothingScore(String value) {
        if (value == null || value.isBlank()) {
            return 0.0;
        }

        return switch (value.trim().toLowerCase()) {
            case "none" -> 0.0;
            case "synthetic" -> 1.0;
            case "tight" -> 2.0;
            case "wool" -> 3.0;
            default -> 1.0;
        };
    }

    @FunctionalInterface
    private interface TrendChartMapper {
        SymptomTrendChartModel map(List<DiaryEntry> entries, LocalDate fromDate, LocalDate toDate);
    }

    private record StatisticsDateWindow(LocalDate fromDate, LocalDate endDate) {
    }

    private record FactorDefinition(
            String key,
            String label,
            String category,
            Function<DiaryEntry, Double> scoreExtractor) {
    }

}
