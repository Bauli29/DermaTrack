package de.dermatrack.backend.diary.api.controller;

import de.dermatrack.backend.diary.api.model.DiaryEntry;
import de.dermatrack.backend.diary.service.DiaryService;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class DiaryController implements IDiaryController {

    private final DiaryService diaryService;

    @Override
    public ResponseEntity<List<DiaryEntry>> getAllDiaryEntries() {
        log.debug("Controller: Getting all diary entries");

        List<DiaryEntry> entries = diaryService.findAll();

        return ResponseEntity.ok(entries);
    }

    @Override
    public ResponseEntity<DiaryEntry> getDiaryEntryById(UUID id) {
        log.debug("Controller: Getting diary entry by id: {}", id);

        DiaryEntry entry = diaryService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DiaryEntry", "id", id));

        return ResponseEntity.ok(entry);
    }

    @Override
    public ResponseEntity<DiaryEntry> createDiaryEntry(DiaryEntry diaryEntry) {
        log.debug("Controller: Creating new diary entry");

        DiaryEntry savedEntry = diaryService.save(diaryEntry);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedEntry);
    }

    @Override
    public ResponseEntity<DiaryEntry> updateDiaryEntry(UUID id, DiaryEntry diaryEntry) {
        log.debug("Controller: Updating diary entry with id: {}", id);

        if (!diaryService.existsById(id)) {
            throw new ResourceNotFoundException("DiaryEntry", "id", id);
        }

        diaryEntry.setId(id);
        DiaryEntry updatedEntry = diaryService.save(diaryEntry);

        return ResponseEntity.ok(updatedEntry);
    }

    @Override
    public ResponseEntity<Void> deleteDiaryEntry(UUID id) {
        log.debug("Controller: Deleting diary entry with id: {}", id);

        if (!diaryService.existsById(id)) {
            throw new ResourceNotFoundException("DiaryEntry", "id", id);
        }

        diaryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}