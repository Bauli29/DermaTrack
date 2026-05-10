package de.dermatrack.backend.statistics.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.exception.NotEnoughDataForCorrelationException;
import de.dermatrack.backend.statistics.model.common.HighchartsModel;
import de.dermatrack.backend.statistics.model.correlation.StatisticsMainCategory;
import de.dermatrack.backend.statistics.service.ICorrelationCalculator;
import de.dermatrack.backend.statistics.service.IWeightedSymptomCalculator;
import de.dermatrack.backend.statistics.support.StatisticsTestDataFactory;

@ExtendWith(MockitoExtension.class)
@DisplayName("StatisticsCorrelationBarChartMapper Unit Tests")
class StatisticsCorrelationBarChartMapperTest {

    @Mock
    private ICorrelationCalculator correlationCalculator;

    @Mock
    private IWeightedSymptomCalculator weightedSymptomCalculator;

    private StatisticsCorrelationBarChartMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new StatisticsCorrelationBarChartMapper(correlationCalculator, weightedSymptomCalculator);
    }

    @Test
    @DisplayName("toHighchartsModel() should create chart with correlation values for 7-day period")
    void toSymptomTrendChart_WithValidDataFor7Days_ShouldReturnCorrelationChart() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        DiaryEntry entry1 = buildEntryWithCareFactors(fromDate, true, false, true, false);
        DiaryEntry entry2 = buildEntryWithCareFactors(fromDate.plusDays(1), false, true, false, true);
        DiaryEntry entry3 = buildEntryWithCareFactors(fromDate.plusDays(2), true, true, false, false);
        DiaryEntry entry4 = buildEntryWithCareFactors(fromDate.plusDays(3), false, false, true, true);
        DiaryEntry entry5 = buildEntryWithCareFactors(fromDate.plusDays(4), true, false, false, true);
        DiaryEntry entry6 = buildEntryWithCareFactors(fromDate.plusDays(5), false, true, true, false);
        DiaryEntry entry7 = buildEntryWithCareFactors(endDate, true, true, true, true);

        List<DiaryEntry> entries = List.of(entry1, entry2, entry3, entry4, entry5, entry6, entry7);

        when(weightedSymptomCalculator.calculateSymptomWeight(any(DiaryEntry.class)))
                .thenReturn(2.5, 3.0, 2.0, 3.5, 2.8, 3.2, 2.9);

        when(correlationCalculator.calculatePearsonCorrelation(any(List.class), any(List.class)))
                .thenReturn(0.85, 0.65, 0.75, -0.45);

        HighchartsModel result = mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS);

        assertThat(result.getChartType()).isEqualTo("column");
        assertThat(result.getCategories()).hasSize(4);
        assertThat(result.getCategories()).containsExactly("Skin Care", "Hair Products", "Soap Shampoo", "Cosmetics");
        assertThat(result.getSeries()).hasSize(1);
        assertThat(result.getSeries().get(0).getName()).isEqualTo("Correlation");
        assertThat(result.getSeries().get(0).getData()).hasSize(4);
        assertThat(result.getDateRange().getFrom()).isEqualTo(fromDate);
        assertThat(result.getDateRange().getTo()).isEqualTo(endDate);
    }

    @Test
    @DisplayName("toHighchartsModel() should handle null correlations and exclude them from result")
    void toSymptomTrendChart_WithNullCorrelations_ShouldFilterOutNullValues() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        DiaryEntry entry1 = buildEntryWithCareFactors(fromDate, true, false, null, false);
        DiaryEntry entry2 = buildEntryWithCareFactors(fromDate.plusDays(1), false, true, null, true);
        DiaryEntry entry3 = buildEntryWithCareFactors(fromDate.plusDays(2), true, true, null, false);
        DiaryEntry entry4 = buildEntryWithCareFactors(fromDate.plusDays(3), false, false, null, true);
        DiaryEntry entry5 = buildEntryWithCareFactors(fromDate.plusDays(4), true, false, null, true);
        DiaryEntry entry6 = buildEntryWithCareFactors(fromDate.plusDays(5), false, true, null, false);
        DiaryEntry entry7 = buildEntryWithCareFactors(endDate, true, true, null, true);

        List<DiaryEntry> entries = List.of(entry1, entry2, entry3, entry4, entry5, entry6, entry7);

        when(weightedSymptomCalculator.calculateSymptomWeight(any(DiaryEntry.class)))
                .thenReturn(2.5, 3.0, 2.0, 3.5, 2.8, 3.2, 2.9);

        when(correlationCalculator.calculatePearsonCorrelation(any(List.class), any(List.class)))
                .thenReturn(0.85, // Skin Care
                        0.65, // Hair Products
                        null, // Soap Shampoo returns null
                        -0.45); // Cosmetics

        HighchartsModel result = mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS);

        // Should only include non-null correlations
        assertThat(result.getCategories()).hasSize(3);
        assertThat(result.getCategories()).containsExactly("Skin Care", "Hair Products", "Cosmetics");
        assertThat(result.getSeries().get(0).getData()).containsExactly(0.85, 0.65, -0.45);
    }

    @Test
    @DisplayName("toHighchartsModel() should throw exception for insufficient data (7-day period needs 7 entries)")
    void toSymptomTrendChart_With6EntriesFor7Days_ShouldThrowNotEnoughDataException() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        List<DiaryEntry> entries = List.of(
                buildEntryWithCareFactors(fromDate, true, false, true, false),
                buildEntryWithCareFactors(fromDate.plusDays(1), false, true, false, true),
                buildEntryWithCareFactors(fromDate.plusDays(2), true, true, false, false),
                buildEntryWithCareFactors(fromDate.plusDays(3), false, false, true, true),
                buildEntryWithCareFactors(fromDate.plusDays(4), true, false, false, true),
                buildEntryWithCareFactors(fromDate.plusDays(5), false, true, true, false));

        assertThatThrownBy(() -> mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS))
                .isInstanceOf(NotEnoughDataForCorrelationException.class)
                .hasMessage("Not enough Data for Correlation Calculation");
    }

    @Test
    @DisplayName("toHighchartsModel() should pass with exactly 7 entries for 7-day period")
    void toSymptomTrendChart_With7EntriesFor7Days_ShouldSucceed() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        List<DiaryEntry> entries = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            entries.add(buildEntryWithCareFactors(fromDate.plusDays(i), true, false, true, false));
        }

        when(weightedSymptomCalculator.calculateSymptomWeight(any(DiaryEntry.class)))
                .thenReturn(2.5);

        when(correlationCalculator.calculatePearsonCorrelation(any(List.class), any(List.class)))
                .thenReturn(0.5);

        HighchartsModel result = mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS);

        assertThat(result).isNotNull();
        assertThat(result.getChartType()).isEqualTo("column");
    }

    @Test
    @DisplayName("toHighchartsModel() should require minimum 25 entries for 30-day period")
    void toSymptomTrendChart_With24EntriesFor30Days_ShouldThrowNotEnoughDataException() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(29);

        List<DiaryEntry> entries = new ArrayList<>();
        for (int i = 0; i < 24; i++) {
            entries.add(buildEntryWithCareFactors(fromDate.plusDays(i), true, false, true, false));
        }

        assertThatThrownBy(() -> mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS))
                .isInstanceOf(NotEnoughDataForCorrelationException.class)
                .hasMessage("Not enough Data for Correlation Calculation");
    }

    @Test
    @DisplayName("toHighchartsModel() should pass with exactly 25 entries for 30-day period")
    void toSymptomTrendChart_With25EntriesFor30Days_ShouldSucceed() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(29);

        List<DiaryEntry> entries = new ArrayList<>();
        for (int i = 0; i < 25; i++) {
            entries.add(buildEntryWithCareFactors(fromDate.plusDays(i), true, false, true, false));
        }

        when(weightedSymptomCalculator.calculateSymptomWeight(any(DiaryEntry.class)))
                .thenReturn(2.5);

        when(correlationCalculator.calculatePearsonCorrelation(any(List.class), any(List.class)))
                .thenReturn(0.5);

        HighchartsModel result = mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("toHighchartsModel() should require minimum 75 entries for 90-day period")
    void toSymptomTrendChart_With74EntriesFor90Days_ShouldThrowNotEnoughDataException() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(89);

        List<DiaryEntry> entries = new ArrayList<>();
        for (int i = 0; i < 74; i++) {
            entries.add(buildEntryWithCareFactors(fromDate.plusDays(i), true, false, true, false));
        }

        assertThatThrownBy(() -> mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS))
                .isInstanceOf(NotEnoughDataForCorrelationException.class)
                .hasMessage("Not enough Data for Correlation Calculation");
    }

    @Test
    @DisplayName("toHighchartsModel() should pass with exactly 75 entries for 90-day period")
    void toSymptomTrendChart_With75EntriesFor90Days_ShouldSucceed() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(89);

        List<DiaryEntry> entries = new ArrayList<>();
        for (int i = 0; i < 75; i++) {
            entries.add(buildEntryWithCareFactors(fromDate.plusDays(i), true, false, true, false));
        }

        when(weightedSymptomCalculator.calculateSymptomWeight(any(DiaryEntry.class)))
                .thenReturn(2.5);

        when(correlationCalculator.calculatePearsonCorrelation(any(List.class), any(List.class)))
                .thenReturn(0.5);

        HighchartsModel result = mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("toHighchartsModel() should require minimum 300 entries for 365-day period")
    void toSymptomTrendChart_With299EntriesFor365Days_ShouldThrowNotEnoughDataException() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(364);

        List<DiaryEntry> entries = new ArrayList<>();
        for (int i = 0; i < 299; i++) {
            entries.add(buildEntryWithCareFactors(fromDate.plusDays(i), true, false, true, false));
        }

        assertThatThrownBy(() -> mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS))
                .isInstanceOf(NotEnoughDataForCorrelationException.class)
                .hasMessage("Not enough Data for Correlation Calculation");
    }

    @Test
    @DisplayName("toHighchartsModel() should pass with exactly 300 entries for 365-day period")
    void toSymptomTrendChart_With300EntriesFor365Days_ShouldSucceed() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(364);

        List<DiaryEntry> entries = new ArrayList<>();
        for (int i = 0; i < 300; i++) {
            entries.add(buildEntryWithCareFactors(fromDate.plusDays(i), true, false, true, false));
        }

        when(weightedSymptomCalculator.calculateSymptomWeight(any(DiaryEntry.class)))
                .thenReturn(2.5);

        when(correlationCalculator.calculatePearsonCorrelation(any(List.class), any(List.class)))
                .thenReturn(0.5);

        HighchartsModel result = mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS);

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("toHighchartsModel() should handle null entries list gracefully")
    void toSymptomTrendChart_WithNullEntries_ShouldThrowNotEnoughDataException() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        assertThatThrownBy(() -> mapper.toHighchartsModel(
                null,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS))
                .isInstanceOf(NotEnoughDataForCorrelationException.class)
                .hasMessage("Not enough Data for Correlation Calculation");
    }

    @Test
    @DisplayName("toHighchartsModel() should calculate correlations for all subcategories")
    void toSymptomTrendChart_ShouldCalculateCorrelationForEachSubcategory() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        List<DiaryEntry> entries = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            entries.add(buildEntryWithCareFactors(fromDate.plusDays(i), true, false, true, false));
        }

        when(weightedSymptomCalculator.calculateSymptomWeight(any(DiaryEntry.class)))
                .thenReturn(2.5);

        when(correlationCalculator.calculatePearsonCorrelation(any(List.class), any(List.class)))
                .thenReturn(0.8, 0.6, 0.7, 0.5);

        mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.CARE_PRODUCTS);

        // Verify correlation calculator was called 4 times (once for each care product
        // subcategory)
        verify(correlationCalculator, times(4))
                .calculatePearsonCorrelation(any(List.class), any(List.class));
    }

    @Test
    @DisplayName("toHighchartsModel() should work with NUTRITION category")
    void toSymptomTrendChart_WithNutritionCategory_ShouldReturnNutritionSubcategories() {
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        List<DiaryEntry> entries = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            DiaryEntry entry = buildEntryWithNutritionFactors(fromDate.plusDays(i), true, false, true, false, true);
            entries.add(entry);
        }

        when(weightedSymptomCalculator.calculateSymptomWeight(any(DiaryEntry.class)))
                .thenReturn(2.5);

        when(correlationCalculator.calculatePearsonCorrelation(any(List.class), any(List.class)))
                .thenReturn(0.5);

        HighchartsModel result = mapper.toHighchartsModel(
                entries,
                fromDate,
                endDate,
                StatisticsMainCategory.NUTRITION);

        assertThat(result.getCategories()).hasSize(5);
        assertThat(result.getCategories()).containsExactly("Nuts", "Fruits", "Shellfish", "Dairy", "Gluten");
    }

    private DiaryEntry buildEntryWithCareFactors(LocalDate date, Boolean skinCare, Boolean hairProducts,
            Boolean soapShampoo, Boolean cosmetics) {
        DiaryEntry entry = new DiaryEntry();
        entry.setEntryDate(date);
        entry.setCareSkinCare(skinCare);
        entry.setCareHairProducts(hairProducts);
        entry.setCareSoapShampoo(soapShampoo);
        entry.setCareCosmetics(cosmetics);
        entry.setSymptomItchiness(2);
        entry.setSymptomDryness(1);
        entry.setSymptomInflammation(1);
        return entry;
    }

    private DiaryEntry buildEntryWithNutritionFactors(LocalDate date, Boolean nuts, Boolean fruits,
            Boolean shellfish, Boolean dairy, Boolean gluten) {
        DiaryEntry entry = new DiaryEntry();
        entry.setEntryDate(date);
        entry.setNutritionNuts(nuts);
        entry.setNutritionFruits(fruits);
        entry.setNutritionShellfish(shellfish);
        entry.setNutritionDairy(dairy);
        entry.setNutritionGluten(gluten);
        entry.setSymptomItchiness(2);
        entry.setSymptomDryness(1);
        entry.setSymptomInflammation(1);
        return entry;
    }
}
