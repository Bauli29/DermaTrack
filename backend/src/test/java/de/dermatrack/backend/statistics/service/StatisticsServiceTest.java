package de.dermatrack.backend.statistics.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;
import de.dermatrack.backend.statistics.mapper.StatisticsBarChartMapper;
import de.dermatrack.backend.statistics.mapper.StatisticsLineChartMapper;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;
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

    @InjectMocks
    private StatisticsService statisticsService;

    @Test
    @DisplayName("getSymptomTrendLineLast7Days() should fetch owner entries in 7-day window and map result")
    void getSymptomTrendLineLast7Days_ShouldQueryRangeAndMap() {
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

        SymptomTrendChartModel result = statisticsService.getSymptomTrendLineLast7Days(userId, endDate);

        assertThat(result).isSameAs(expected);
        verify(diaryEntryRepository).findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate);
        verify(statisticsLineChartMapper).toSymptomTrendChart(entries, fromDate, endDate);
    }

    @Test
    @DisplayName("getSymptomTrendBarLast7Days() should fetch owner entries in 7-day window and map result")
    void getSymptomTrendBarLast7Days_ShouldQueryRangeAndMap() {
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

        SymptomTrendChartModel result = statisticsService.getSymptomTrendBarLast7Days(userId, endDate);

        assertThat(result).isSameAs(expected);
        verify(diaryEntryRepository).findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, endDate);
        verify(statisticsBarChartMapper).toSymptomTrendChart(entries, fromDate, endDate);
    }
}
