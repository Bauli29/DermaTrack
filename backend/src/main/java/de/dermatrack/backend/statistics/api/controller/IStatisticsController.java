package de.dermatrack.backend.statistics.api.controller;

import java.security.Principal;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import de.dermatrack.backend.exception.ErrorResponse;
import de.dermatrack.backend.statistics.model.line.SymptomTrendChartModel;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/statistics")
@Validated
@Tag(name = "Statistics")
public interface IStatisticsController {

    @Operation(summary = "Get 7-day psyche and weighted symptoms statistics for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistics chart returned", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = SymptomTrendChartModel.class)) }),
            @ApiResponse(responseCode = "400", description = "Invalid endDate supplied", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Authenticated user not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
    @GetMapping("/psyche-symptoms")
    ResponseEntity<SymptomTrendChartModel> getPsycheAndSymptomsLast7Days(
            Principal principal,
            @Parameter(description = "Inclusive end date in YYYY-MM-DD format. Defaults to today when omitted.")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate);

    @Operation(summary = "Get 7-day symptom statistics for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistics chart returned", content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = SymptomTrendChartModel.class)) }),
            @ApiResponse(responseCode = "400", description = "Invalid endDate supplied", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Authenticated user not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
    @GetMapping("/symptoms")
    ResponseEntity<SymptomTrendChartModel> getSymptomsLast7Days(
            Principal principal,
            @Parameter(description = "Inclusive end date in YYYY-MM-DD format. Defaults to today when omitted.")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate);
}
