package de.dermatrack.backend.statistics.service;

import java.time.LocalDate;
import java.util.UUID;

import de.dermatrack.backend.statistics.model.common.HighchartsModel;
import de.dermatrack.backend.statistics.model.common.StatisticsPeriod;

public interface IStatisticsService {

    HighchartsModel getSymptomTrendLine(UUID userId, LocalDate endDate, StatisticsPeriod period);

    HighchartsModel getSymptomTrendBar(UUID userId, LocalDate endDate, StatisticsPeriod period);

    HighchartsModel getCorrelationTrendBar(UUID userId, LocalDate endDate, StatisticsPeriod period,
            String mainCategory);
}
