package de.dermatrack.backend.statistics.api.controller;

import java.security.Principal;
import java.time.LocalDate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import de.dermatrack.backend.statistics.model.common.StatisticsPeriod;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;
import de.dermatrack.backend.statistics.service.IStatisticsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class StatisticsController implements IStatisticsController {

    private final IStatisticsService statisticsService;
    private final IAppUserRepository appUserRepository;

    @Override
    public ResponseEntity<SymptomTrendChartModel> getPsycheAndSymptoms(
            Principal principal,
            LocalDate endDate,
            String period) {
        AppUser currentUser = resolveCurrentUser(principal);
        return ResponseEntity.ok(
                statisticsService.getSymptomTrendLine(
                        currentUser.getId(),
                        endDate,
                        StatisticsPeriod.fromQueryValue(period)));
    }

    @Override
    public ResponseEntity<SymptomTrendChartModel> getSymptoms(
            Principal principal,
            LocalDate endDate,
            String period) {
        AppUser currentUser = resolveCurrentUser(principal);
        return ResponseEntity.ok(
                statisticsService.getSymptomTrendBar(
                        currentUser.getId(),
                        endDate,
                        StatisticsPeriod.fromQueryValue(period)));
    }

    private AppUser resolveCurrentUser(Principal principal) {
        return appUserRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("AppUser", "username", principal.getName()));
    }

    @Override
    public ResponseEntity<SymptomTrendChartModel> getCorrelation(Principal principal, LocalDate endDate, String period,
            String mainCategory) {
        AppUser currentUser = resolveCurrentUser(principal);
        return ResponseEntity.ok(
                statisticsService.getCorrelationTrendBar(
                        currentUser.getId(),
                        endDate,
                        StatisticsPeriod.fromQueryValue(period),
                        mainCategory));
    }
}
