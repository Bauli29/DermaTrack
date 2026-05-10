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
import de.dermatrack.backend.statistics.model.common.StatisticsPeriod;
import de.dermatrack.backend.statistics.model.correlation.StatisticsMainCategory;
import de.dermatrack.backend.statistics.model.common.HighchartsModel;
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
    public HighchartsModel getSymptomTrendLine(UUID userId, LocalDate endDate, StatisticsPeriod period) {
        return getTrend(userId, endDate, period, statisticsLineChartMapper::toHighchartsModel);
    }

    @Override
    public HighchartsModel getSymptomTrendBar(UUID userId, LocalDate endDate, StatisticsPeriod period) {
        return getTrend(userId, endDate, period, statisticsBarChartMapper::toHighchartsModel);
    }

    @Override
    public HighchartsModel getCorrelationTrendBar(UUID userId, LocalDate endDate, StatisticsPeriod period,
            String mainCategory) {
        StatisticsMainCategory resolvedMainCategory = StatisticsMainCategory.fromQueryValue(mainCategory);
        return getTrend(userId, endDate, period,
                (entries, fromDate, toDate) -> statisticsCorrelationBarChartMapper.toHighchartsModel(entries,
                        fromDate, toDate, resolvedMainCategory));
    }

    private HighchartsModel getTrend(
            UUID userId,
            LocalDate endDate,
            StatisticsPeriod period,
            TrendChartMapper mapper) {
        LocalDate effectiveEndDate = endDate == null ? LocalDate.now() : endDate;
        StatisticsPeriod effectivePeriod = period == null ? StatisticsPeriod.LAST_7_DAYS : period;
        LocalDate fromDate = effectiveEndDate.minusDays(effectivePeriod.getDays() - 1L);

        List<DiaryEntry> entries = diaryEntryRepository
                .findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, effectiveEndDate);

        return mapper.map(entries, fromDate, effectiveEndDate);
    }

    @FunctionalInterface
    private interface TrendChartMapper {
        HighchartsModel map(List<DiaryEntry> entries, LocalDate fromDate, LocalDate toDate);
    }
}
