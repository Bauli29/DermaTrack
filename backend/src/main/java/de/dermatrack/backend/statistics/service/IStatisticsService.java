package de.dermatrack.backend.statistics.service;

import java.time.LocalDate;
import java.util.UUID;

import de.dermatrack.backend.statistics.model.common.StatisticsPeriod;
import de.dermatrack.backend.statistics.model.factors.FactorImpactStatisticsModel;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;

public interface IStatisticsService {

    SymptomTrendChartModel getSymptomTrendLine(UUID userId, LocalDate fromDate, LocalDate endDate,
            StatisticsPeriod period);

    SymptomTrendChartModel getSymptomTrendBar(UUID userId, LocalDate fromDate, LocalDate endDate,
            StatisticsPeriod period);

    FactorImpactStatisticsModel getFactorImpacts(UUID userId, LocalDate fromDate, LocalDate endDate,
            StatisticsPeriod period);
}
