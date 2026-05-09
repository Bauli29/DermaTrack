package de.dermatrack.backend.statistics.service;

import java.time.LocalDate;
import java.util.UUID;

import de.dermatrack.backend.statistics.model.common.StatisticsPeriod;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;

public interface IStatisticsService {

    SymptomTrendChartModel getSymptomTrendLine(UUID userId, LocalDate endDate, StatisticsPeriod period);

    SymptomTrendChartModel getSymptomTrendBar(UUID userId, LocalDate endDate, StatisticsPeriod period);

    SymptomTrendChartModel getCorrelationTrendBar(UUID userId, LocalDate endDate, StatisticsPeriod period,
            String mainCategory);
}
