package de.dermatrack.backend.statistics.service;

import java.time.LocalDate;
import java.util.UUID;

import de.dermatrack.backend.statistics.model.line.SymptomTrendLineChartModel;

public interface IStatisticsService {

    SymptomTrendLineChartModel getSymptomTrendLast7Days(UUID userId, LocalDate endDate);
}
