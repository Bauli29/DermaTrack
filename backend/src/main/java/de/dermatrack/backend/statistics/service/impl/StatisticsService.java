package de.dermatrack.backend.statistics.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;
import de.dermatrack.backend.statistics.mapper.StatisticsBarChartMapper;
import de.dermatrack.backend.statistics.mapper.StatisticsCorrelationBarChartMapper;
import de.dermatrack.backend.statistics.mapper.StatisticsLineChartMapper;
import de.dermatrack.backend.statistics.model.common.HighchartsModel;
import de.dermatrack.backend.statistics.model.correlation.StatisticsMainCategory;
import de.dermatrack.backend.statistics.service.IStatisticsService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService implements IStatisticsService {

    private final IDiaryEntryRepository diaryEntryRepository;
    private final StatisticsLineChartMapper statisticsLineChartMapper;
    private final StatisticsBarChartMapper statisticsBarChartMapper;
    private final StatisticsCorrelationBarChartMapper statisticsCorrelationBarChartMapper;

    @Override
    public HighchartsModel getSymptomTrendLine(UUID userId, LocalDate startDate, LocalDate endDate) {
        return getTrend(userId, startDate, endDate, statisticsLineChartMapper::toHighchartsModel);
    }

    @Override
    public HighchartsModel getSymptomTrendBar(UUID userId, LocalDate startDate, LocalDate endDate) {
        return getTrend(userId, startDate, endDate, statisticsBarChartMapper::toHighchartsModel);
    }

    @Override
    public HighchartsModel getCorrelationTrendBar(UUID userId, LocalDate startDate, LocalDate endDate,
            String mainCategory) {
        StatisticsMainCategory resolvedMainCategory = StatisticsMainCategory.fromQueryValue(mainCategory);
        return getTrend(userId, startDate, endDate,
                (entries, fromDate, toDate) -> statisticsCorrelationBarChartMapper.toHighchartsModel(entries,
                        fromDate, toDate, resolvedMainCategory));
    }

    private HighchartsModel getTrend(
            UUID userId,
            LocalDate startDate,
            LocalDate endDate,
            TrendChartMapper mapper) {
        LocalDate effectiveEndDate = endDate == null ? LocalDate.now() : endDate;
        LocalDate effectiveStartDate = startDate == null ? effectiveEndDate.minusDays(6) : startDate;

        List<DiaryEntry> entries = diaryEntryRepository
                .findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, effectiveStartDate, effectiveEndDate);

        return mapper.map(entries, effectiveStartDate, effectiveEndDate);
    }

    @FunctionalInterface
    private interface TrendChartMapper {
        HighchartsModel map(List<DiaryEntry> entries, LocalDate fromDate, LocalDate toDate);
    }
}
