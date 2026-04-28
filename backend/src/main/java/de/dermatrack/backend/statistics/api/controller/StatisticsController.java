package de.dermatrack.backend.statistics.api.controller;

import java.security.Principal;
import java.time.LocalDate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;
import de.dermatrack.backend.statistics.service.IStatisticsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class StatisticsController implements IStatisticsController {

    private final IStatisticsService statisticsService;
    private final IAppUserRepository appUserRepository;

    @Override
    public ResponseEntity<SymptomTrendChartModel> getPsycheAndSymptomsLast7Days(
            Principal principal,
            LocalDate endDate) {
        AppUser currentUser = resolveCurrentUser(principal);
        return ResponseEntity.ok(statisticsService.getSymptomTrendLineLast7Days(currentUser.getId(), endDate));
    }

    @Override
    public ResponseEntity<SymptomTrendChartModel> getSymptomsLast7Days(Principal principal, LocalDate endDate) {
        AppUser currentUser = resolveCurrentUser(principal);
        return ResponseEntity.ok(statisticsService.getSymptomTrendBarLast7Days(currentUser.getId(), endDate));
    }

    private AppUser resolveCurrentUser(Principal principal) {
        return appUserRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("AppUser", "username", principal.getName()));
    }
}
