package de.dermatrack.backend.diary.api.controller;

import de.dermatrack.backend.diary.api.model.DiaryEntry;
import de.dermatrack.backend.diary.service.DiaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*") // TODO: Configure for production
public class DiaryController implements IDiaryController {

    private final DiaryService diaryService;

    @Override
    public ResponseEntity<List<DiaryEntry>> getAllDiaryEntries() {
        log.debug("Controller: Getting all diary entries");

        // Controller → Service → Repository → Database
        List<DiaryEntry> entries = diaryService.findAll();

        return ResponseEntity.ok(entries);
    }

    @Override
    public ResponseEntity<DiaryEntry> getDiaryEntryById(UUID id) {
        log.debug("Controller: Getting diary entry by id: {}", id);

        // Controller → Service → Repository → Database
        Optional<DiaryEntry> entry = diaryService.findById(id);

        return entry.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Override
    public ResponseEntity<DiaryEntry> createDiaryEntry(DiaryEntry diaryEntry) {
        log.debug("Controller: Creating new diary entry");

        try {
            // Controller → Service → Repository → Database
            DiaryEntry savedEntry = diaryService.save(diaryEntry);

            return ResponseEntity.status(HttpStatus.CREATED).body(savedEntry);

        } catch (Exception e) {
            log.error("Error creating diary entry: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @Override
    public ResponseEntity<DiaryEntry> updateDiaryEntry(UUID id, DiaryEntry diaryEntry) {
        log.debug("Controller: Updating diary entry with id: {}", id);

        try {
            // Check if entry exists first
            if (!diaryService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            // Set the ID to ensure we're updating the correct entry
            diaryEntry.setId(id);

            // Controller → Service → Repository → Database
            DiaryEntry updatedEntry = diaryService.save(diaryEntry);

            return ResponseEntity.ok(updatedEntry);

        } catch (Exception e) {
            log.error("Error updating diary entry: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @Override
    public ResponseEntity<Void> deleteDiaryEntry(UUID id) {
        log.debug("Controller: Deleting diary entry with id: {}", id);

        try {
            // Check if entry exists first
            if (!diaryService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            // Controller → Service → Repository → Database
            diaryService.deleteById(id);

            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            log.error("Error deleting diary entry: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}