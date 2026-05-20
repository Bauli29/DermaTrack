package de.dermatrack.backend.statistics.api.controller;

import java.security.Principal;
import java.time.LocalDate;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import de.dermatrack.backend.statistics.model.common.HighchartsModel;
import de.dermatrack.backend.statistics.service.IStatisticsService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class StatisticsController implements IStatisticsController {

        private final IStatisticsService statisticsService;
        private final IAppUserRepository appUserRepository;

        @Override
        public ResponseEntity<HighchartsModel> getPsycheAndSymptoms(
                        Principal principal,
                        LocalDate startDate,
                        LocalDate endDate) {
                AppUser currentUser = resolveCurrentUser(principal);
                return ResponseEntity.ok(
                                statisticsService.getSymptomTrendLine(
                                                currentUser.getId(),
                                                startDate,
                                                endDate));
        }

        @Override
        public ResponseEntity<HighchartsModel> getSymptoms(
                        Principal principal,
                        LocalDate startDate,
                        LocalDate endDate) {
                AppUser currentUser = resolveCurrentUser(principal);
                return ResponseEntity.ok(
                                statisticsService.getSymptomTrendBar(
                                                currentUser.getId(),
                                                startDate,
                                                endDate));
        }

        @Override
        public ResponseEntity<HighchartsModel> getCorrelation(
                        Principal principal,
                        LocalDate startDate,
                        LocalDate endDate,
                        String mainCategory) {
                AppUser currentUser = resolveCurrentUser(principal);
                return ResponseEntity.ok(
                                statisticsService.getCorrelationTrendBar(
                                                currentUser.getId(),
                                                startDate,
                                                endDate,
                                                mainCategory));
        }

        private AppUser resolveCurrentUser(Principal principal) {
                return appUserRepository.findByUsername(principal.getName())
                                .orElseThrow(() -> new ResourceNotFoundException("AppUser", "username",
                                                principal.getName()));
        }
}
