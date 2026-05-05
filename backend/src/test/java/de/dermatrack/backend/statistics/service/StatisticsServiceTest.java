package de.dermatrack.backend.statistics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;
import de.dermatrack.backend.statistics.mapper.StatisticsBarChartMapper;
import de.dermatrack.backend.statistics.mapper.StatisticsLineChartMapper;
import de.dermatrack.backend.statistics.model.common.StatisticsPeriod;
import de.dermatrack.backend.statistics.model.factors.FactorImpactStatisticsModel;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;
import de.dermatrack.backend.statistics.service.ICorrelationCalculator;
import de.dermatrack.backend.statistics.service.IWeightedSymptomCalculator;
import de.dermatrack.backend.statistics.service.impl.StatisticsService;
import de.dermatrack.backend.statistics.support.StatisticsTestDataFactory;

@ExtendWith(MockitoExtension.class)
@DisplayName("StatisticsService Unit Tests")
class StatisticsServiceTest {

    @Mock
    private IDiaryEntryRepository diaryEntryRepository;

    @Mock
    private StatisticsLineChartMapper statisticsLineChartMapper;

    @Mock
    private StatisticsBarChartMapper statisticsBarChartMapper;

    @Mock
    private IWeightedSymptomCalculator weightedSymptomCalculator;

    @Mock
    private ICorrelationCalculator correlationCalculator;

    @InjectMocks
    private StatisticsService statisticsService;

    @Test
    @DisplayName("getSymptomTrendLine() should fetch owner entries in selected 7-day window and map result")
    void getSymptomTrendLine_ShouldQueryRangeAndMap() {
        UUID userId = UUID.randomUUID();
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        List<DiaryEntry> entries = List.of(
                StatisticsTestDataFactory.buildEntryForLineChart(fromDate, 4, 2, 3),
                StatisticsTestDataFactory.buildEntryForLineChart(endDate, 6, 3, 5));

        SymptomTrendChartModel expected = new SymptomTrendChartModel();

        when(diaryEntryRepository.findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate))
                .thenReturn(entries);
        when(statisticsLineChartMapper.toSymptomTrendChart(entries, fromDate, endDate)).thenReturn(expected);

        SymptomTrendChartModel result = statisticsService.getSymptomTrendLine(
                userId,
                null,
                endDate,
                StatisticsPeriod.LAST_7_DAYS);

        assertThat(result).isSameAs(expected);
        verify(diaryEntryRepository).findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate);
        verify(statisticsLineChartMapper).toSymptomTrendChart(entries, fromDate, endDate);
    }

    @Test
    @DisplayName("getSymptomTrendBar() should fetch owner entries in selected 7-day window and map result")
    void getSymptomTrendBar_ShouldQueryRangeAndMap() {
        UUID userId = UUID.randomUUID();
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(6);

        List<DiaryEntry> entries = List.of(
                StatisticsTestDataFactory.buildEntryForBarChart(fromDate, 4, 2, 3, true, false, false),
                StatisticsTestDataFactory.buildEntryForBarChart(endDate, 6, 3, 5, false, true, true));

        SymptomTrendChartModel expected = new SymptomTrendChartModel();

        when(diaryEntryRepository.findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate))
                .thenReturn(entries);
        when(statisticsBarChartMapper.toSymptomTrendChart(entries, fromDate, endDate)).thenReturn(expected);

        SymptomTrendChartModel result = statisticsService.getSymptomTrendBar(
                userId,
                null,
                endDate,
                StatisticsPeriod.LAST_7_DAYS);

        assertThat(result).isSameAs(expected);
        verify(diaryEntryRepository).findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate);
        verify(statisticsBarChartMapper).toSymptomTrendChart(entries, fromDate, endDate);
    }

    @Test
    @DisplayName("getSymptomTrendLine() should default endDate to today when omitted")
    void getSymptomTrendLine_WithNullEndDate_ShouldDefaultToToday() {
        UUID userId = UUID.randomUUID();
        LocalDate beforeCall = LocalDate.now();
        List<DiaryEntry> entries = List.of();
        SymptomTrendChartModel expected = new SymptomTrendChartModel();

        when(diaryEntryRepository.findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(
                eq(userId),
                any(LocalDate.class),
                any(LocalDate.class)))
                .thenReturn(entries);
        when(statisticsLineChartMapper.toSymptomTrendChart(
                eq(entries),
                any(LocalDate.class),
                any(LocalDate.class)))
                .thenReturn(expected);

        SymptomTrendChartModel result = statisticsService.getSymptomTrendLine(
                userId,
                null,
                null,
                StatisticsPeriod.LAST_7_DAYS);
        LocalDate afterCall = LocalDate.now();

        ArgumentCaptor<LocalDate> fromDateCaptor = ArgumentCaptor.forClass(LocalDate.class);
        ArgumentCaptor<LocalDate> endDateCaptor = ArgumentCaptor.forClass(LocalDate.class);

        assertThat(result).isSameAs(expected);
        verify(diaryEntryRepository).findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(
                eq(userId),
                fromDateCaptor.capture(),
                endDateCaptor.capture());
        verify(statisticsLineChartMapper).toSymptomTrendChart(
                entries,
                fromDateCaptor.getValue(),
                endDateCaptor.getValue());
        assertThat(endDateCaptor.getValue()).isBetween(beforeCall, afterCall);
        assertThat(fromDateCaptor.getValue()).isEqualTo(endDateCaptor.getValue().minusDays(6));
    }

    @Test
    @DisplayName("getSymptomTrendLine() should use the selected broader period")
    void getSymptomTrendLine_WithThirtyDayPeriod_ShouldQueryThirtyDayRange() {
        UUID userId = UUID.randomUUID();
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(29);
        List<DiaryEntry> entries = List.of();
        SymptomTrendChartModel expected = new SymptomTrendChartModel();

        when(diaryEntryRepository.findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate))
                .thenReturn(entries);
        when(statisticsLineChartMapper.toSymptomTrendChart(entries, fromDate, endDate)).thenReturn(expected);

        SymptomTrendChartModel result = statisticsService.getSymptomTrendLine(
                userId,
                null,
                endDate,
                StatisticsPeriod.LAST_30_DAYS);

        assertThat(result).isSameAs(expected);
        verify(diaryEntryRepository).findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate);
        verify(statisticsLineChartMapper).toSymptomTrendChart(entries, fromDate, endDate);
    }

    @Test
    @DisplayName("getSymptomTrendLine() should default omitted period to 30 days")
    void getSymptomTrendLine_WithNullPeriod_ShouldQueryThirtyDayRange() {
        UUID userId = UUID.randomUUID();
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(29);
        List<DiaryEntry> entries = List.of();
        SymptomTrendChartModel expected = new SymptomTrendChartModel();

        when(diaryEntryRepository.findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate))
                .thenReturn(entries);
        when(statisticsLineChartMapper.toSymptomTrendChart(entries, fromDate, endDate)).thenReturn(expected);

        SymptomTrendChartModel result = statisticsService.getSymptomTrendLine(
                userId,
                null,
                endDate,
                null);

        assertThat(result).isSameAs(expected);
        verify(diaryEntryRepository).findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate);
        verify(statisticsLineChartMapper).toSymptomTrendChart(entries, fromDate, endDate);
    }

    @Test
    @DisplayName("getSymptomTrendLine() should use custom fromDate when supplied")
    void getSymptomTrendLine_WithFromDate_ShouldQueryCustomRange() {
        UUID userId = UUID.randomUUID();
        LocalDate fromDate = LocalDate.of(2026, 4, 10);
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        List<DiaryEntry> entries = List.of();
        SymptomTrendChartModel expected = new SymptomTrendChartModel();

        when(diaryEntryRepository.findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate))
                .thenReturn(entries);
        when(statisticsLineChartMapper.toSymptomTrendChart(entries, fromDate, endDate)).thenReturn(expected);

        SymptomTrendChartModel result = statisticsService.getSymptomTrendLine(
                userId,
                fromDate,
                endDate,
                StatisticsPeriod.LAST_30_DAYS);

        assertThat(result).isSameAs(expected);
        verify(diaryEntryRepository).findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate);
        verify(statisticsLineChartMapper).toSymptomTrendChart(entries, fromDate, endDate);
    }

    @Test
    @DisplayName("getFactorImpacts() should calculate factor deltas and correlations for selected period")
    void getFactorImpacts_ShouldCalculateFactorImpactStatistics() {
        UUID userId = UUID.randomUUID();
        LocalDate endDate = LocalDate.of(2026, 4, 25);
        LocalDate fromDate = endDate.minusDays(29);

        DiaryEntry nutsEntry = StatisticsTestDataFactory.buildEntryForBarChart(
                LocalDate.of(2026, 4, 24),
                8,
                7,
                6,
                true,
                false,
                false);
        nutsEntry.setNutritionNuts("high");

        DiaryEntry noNutsEntry = StatisticsTestDataFactory.buildEntryForBarChart(
                LocalDate.of(2026, 4, 25),
                2,
                1,
                1,
                false,
                false,
                false);
        noNutsEntry.setNutritionNuts("none");

        List<DiaryEntry> entries = List.of(nutsEntry, noNutsEntry);

        when(diaryEntryRepository.findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate))
                .thenReturn(entries);
        when(weightedSymptomCalculator.calculateSymptomWeight(nutsEntry)).thenReturn(8.0);
        when(weightedSymptomCalculator.calculateSymptomWeight(noNutsEntry)).thenReturn(2.0);
        when(correlationCalculator.calculatePearsonCorrelation(any(), eq(List.of(8.0, 2.0)))).thenReturn(0.75);

        FactorImpactStatisticsModel result = statisticsService.getFactorImpacts(
                userId,
                null,
                endDate,
                StatisticsPeriod.LAST_30_DAYS);

        assertThat(result.getDateRange().getFrom()).isEqualTo(fromDate);
        assertThat(result.getDateRange().getTo()).isEqualTo(endDate);
        assertThat(result.getTotalEntries()).isEqualTo(2);
        assertThat(result.getAverageWeightedSymptomScore()).isEqualTo(5.0);
        assertThat(result.getDataQuality().getDataPointCount()).isEqualTo(2);
        assertThat(result.getDataQuality().getMinimumRecommendedDataPoints()).isEqualTo(7);
        assertThat(result.getDataQuality().isInsufficientData()).isTrue();
        assertThat(result.getFactors())
                .filteredOn(factor -> factor.getKey().equals("nutrition.nuts"))
                .singleElement()
                .satisfies(factor -> {
                    assertThat(factor.getLabel()).isEqualTo("Nuts");
                    assertThat(factor.getCategory()).isEqualTo("Nutrition");
                    assertThat(factor.getOccurrenceCount()).isEqualTo(1);
                    assertThat(factor.getOccurrenceRate()).isEqualTo(50.0);
                    assertThat(factor.getAverageWeightedSymptomScore()).isEqualTo(8.0);
                    assertThat(factor.getWeightedSymptomDelta()).isEqualTo(3.0);
                    assertThat(factor.getPearsonCorrelation()).isEqualTo(0.75);
                });
    }
}
