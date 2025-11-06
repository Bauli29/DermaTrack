package de.dermatrack.backend.diary.api.controller;

import de.dermatrack.backend.diary.api.model.DiaryEntry;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/diary")
@Validated
//TODO: Add Swagger annotations and rm javadocs
public interface IDiaryController {

    /**
     * GET - Get all diary entries
     * @return list of all diary entries
     */
    @GetMapping("")
    ResponseEntity<List<DiaryEntry>> getAllDiaryEntries();

    /**
     * GET - Get diary entry by ID
     * @param id the UUID of the diary entry
     * @return the diary entry if found
     */
    @GetMapping("/{id}")
    ResponseEntity<DiaryEntry> getDiaryEntryById(@PathVariable UUID id);

    /**
     * POST - Create new diary entry
     * @param diaryEntry the diary entry to create
     * @return the created diary entry
     */
    @PostMapping()
    ResponseEntity<DiaryEntry> createDiaryEntry(@RequestBody @Valid DiaryEntry diaryEntry);

    /**
     * PUT - Update existing diary entry
     * @param id the UUID of the diary entry to update
     * @param diaryEntry the updated diary entry data
     * @return the updated diary entry
     */
    @PutMapping("/{id}")
    ResponseEntity<DiaryEntry> updateDiaryEntry(
            @PathVariable UUID id,
            @RequestBody @Valid DiaryEntry diaryEntry
    );

    /**
     * DELETE - Delete diary entry by ID
     * @param id the UUID of the diary entry to delete
     * @return no content response
     */
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteDiaryEntry(@PathVariable UUID id);
}