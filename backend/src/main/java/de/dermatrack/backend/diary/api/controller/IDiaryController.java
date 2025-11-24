package de.dermatrack.backend.diary.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.dermatrack.backend.diary.api.model.DiaryEntry;
import de.dermatrack.backend.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/diary")
@Validated
@Tag(name = "Diary")
// Minimal OpenAPI annotations: tag + operation summaries
public interface IDiaryController {

        /**
         * GET - Get all diary entries
         * 
         * @return list of all diary entries
         */
        @Operation(summary = "Get all diary entries")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Found all Diary Entries", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = DiaryEntry.class)) }),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
        @GetMapping("")
        ResponseEntity<List<DiaryEntry>> getAllDiaryEntries();

        /**
         * GET - Get diary entry by ID
         * 
         * @param id the UUID of the diary entry
         * @return the diary entry if found
         */
        @Operation(summary = "Get diary entry by ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Found the Diary Entry", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = DiaryEntry.class)) }),
                        @ApiResponse(responseCode = "400", description = "Invalid id supplied", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Diary Entry with supplied ID not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
        @GetMapping("/{id}")
        ResponseEntity<DiaryEntry> getDiaryEntryById(@PathVariable UUID id);

        /**
         * POST - Create new diary entry
         * 
         * @param diaryEntry the diary entry to create
         * @return the created diary entry
         */
        @Operation(summary = "Create a new diary entry")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Diary Entry created", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = DiaryEntry.class)) }),
                        @ApiResponse(responseCode = "400", description = "Invalid diary entry supplied", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
        @PostMapping()
        ResponseEntity<DiaryEntry> createDiaryEntry(@RequestBody @Valid DiaryEntry diaryEntry);

        /**
         * PUT - Update existing diary entry
         * 
         * @param id         the UUID of the diary entry to update
         * @param diaryEntry the updated diary entry data
         * @return the updated diary entry
         */
        @Operation(summary = "Update an existing diary entry")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Diary Entry updated", content = {
                                        @Content(mediaType = "application/json", schema = @Schema(implementation = DiaryEntry.class)) }),
                        @ApiResponse(responseCode = "400", description = "Invalid diary entry supplied", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Diary Entry with supplied ID not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
        @PutMapping("/{id}")
        ResponseEntity<DiaryEntry> updateDiaryEntry(
                        @PathVariable UUID id,
                        @RequestBody @Valid DiaryEntry diaryEntry);

        /**
         * DELETE - Delete diary entry by ID
         * 
         * @param id the UUID of the diary entry to delete
         * @return no content response
         */
        @Operation(summary = "Delete diary entry by ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Diary Entry deleted", content = @Content),
                        @ApiResponse(responseCode = "404", description = "Diary Entry with supplied ID not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))) })
        @DeleteMapping("/{id}")
        ResponseEntity<Void> deleteDiaryEntry(@PathVariable UUID id);
}