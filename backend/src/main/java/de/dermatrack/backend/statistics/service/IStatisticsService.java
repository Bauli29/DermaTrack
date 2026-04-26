package de.dermatrack.backend.statistics.service;

import java.time.LocalDate;
import java.util.UUID;

import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;

public interface IStatisticsService {

    SymptomTrendChartModel getSymptomTrendLineLast7Days(UUID userId, LocalDate endDate);
    SymptomTrendChartModel getSymptomTrendBarLast7Days(UUID userId, LocalDate endDate);
}
