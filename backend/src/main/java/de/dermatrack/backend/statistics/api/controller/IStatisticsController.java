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
import de.dermatrack.backend.statistics.model.common.HighchartsModel;
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

        @Operation(summary = "Get psyche and weighted symptoms statistics for the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Statistics chart for psyche & symptoms returned", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = HighchartsModel.class)) }),
                        @ApiResponse(responseCode = "400", description = "Invalid date supplied", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Authenticated user not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
        @GetMapping("/psyche-symptoms")
        ResponseEntity<HighchartsModel> getPsycheAndSymptoms(
                        Principal principal,
                        @Parameter(description = "Inclusive start date in YYYY-MM-DD format. Defaults to 7 days before endDate when omitted.") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "Inclusive end date in YYYY-MM-DD format. Defaults to today when omitted.") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate);

        @Operation(summary = "Get symptom statistics for the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Statistics chart for symptoms returned", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = HighchartsModel.class)) }),
                        @ApiResponse(responseCode = "400", description = "Invalid date supplied", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Authenticated user not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
        @GetMapping("/symptoms")
        ResponseEntity<HighchartsModel> getSymptoms(
                        Principal principal,
                        @Parameter(description = "Inclusive start date in YYYY-MM-DD format. Defaults to 7 days before endDate when omitted.") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "Inclusive end date in YYYY-MM-DD format. Defaults to today when omitted.") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate);

        @Operation(summary = "Get correlation statistics for the authenticated user")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Statistics chart for correlation returned", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = HighchartsModel.class)) }),
                        @ApiResponse(responseCode = "400", description = "Invalid date supplied", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "422", description = "Not enough data for correlation calculation", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Authenticated user not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
        @GetMapping("/correlation")
        ResponseEntity<HighchartsModel> getCorrelation(
                        Principal principal,
                        @Parameter(description = "Inclusive start date in YYYY-MM-DD format. Defaults to 7 days before endDate when omitted.") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "Inclusive end date in YYYY-MM-DD format. Defaults to today when omitted.") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @Parameter(description = "Main category. Supported values: care-products, nutrition, contact-factors, health-factors. Defaults to care-products when omitted.") @RequestParam(required = false, defaultValue = "care-products") String mainCategory);
}
