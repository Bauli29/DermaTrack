package de.dermatrack.backend.statistics.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;
import de.dermatrack.backend.statistics.mapper.StatisticsLineChartMapper;
import de.dermatrack.backend.statistics.model.line.SymptomTrendLineChartModel;
import de.dermatrack.backend.statistics.service.IStatisticsService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatisticsService implements IStatisticsService {

    private final IDiaryEntryRepository diaryEntryRepository;
    private final StatisticsLineChartMapper statisticsLineChartMapper;

    @Override
    public SymptomTrendLineChartModel getSymptomTrendLast7Days(UUID userId, LocalDate endDate) {
        LocalDate effectiveEndDate = endDate == null ? LocalDate.now() : endDate;
        LocalDate fromDate = effectiveEndDate.minusDays(6);

        List<DiaryEntry> entries = diaryEntryRepository
                .findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, effectiveEndDate);

        return statisticsLineChartMapper.toSymptomTrendChart(entries, fromDate, effectiveEndDate);
    }
}
