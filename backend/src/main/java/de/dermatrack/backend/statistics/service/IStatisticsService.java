package de.dermatrack.backend.statistics.service;

import java.time.LocalDate;
import java.util.UUID;

import de.dermatrack.backend.statistics.model.common.HighchartsModel;

public interface IStatisticsService {

    HighchartsModel getSymptomTrendLine(UUID userId, LocalDate startDate, LocalDate endDate);

    HighchartsModel getSymptomTrendBar(UUID userId, LocalDate startDate, LocalDate endDate);

    HighchartsModel getCorrelationTrendBar(UUID userId, LocalDate startDate, LocalDate endDate,
            String mainCategory);
}
