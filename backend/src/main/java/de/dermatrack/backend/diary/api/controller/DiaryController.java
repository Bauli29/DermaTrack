package de.dermatrack.backend.diary.api.controller;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import de.dermatrack.backend.auth.api.model.AppUser;
import de.dermatrack.backend.auth.api.repository.IAppUserRepository;
import de.dermatrack.backend.diary.api.model.DiaryEntry;
import de.dermatrack.backend.diary.service.DiaryService;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class DiaryController implements IDiaryController {

    private final DiaryService diaryService;
    private final IAppUserRepository appUserRepository;
    // Service handles all exceptions

    @Override
    public ResponseEntity<List<DiaryEntry>> getAllDiaryEntries() {
        log.debug("Controller: Getting all diary entries");

        List<DiaryEntry> entries = diaryService.findAll();

        return ResponseEntity.ok(entries);
    }

    @Override
    public ResponseEntity<DiaryEntry> getDiaryEntryById(UUID id) {
        log.debug("Controller: Getting diary entry by id: {}", id);

        DiaryEntry entry = diaryService.findById(id);

        return ResponseEntity.ok(entry);
    }

    @Override
    public ResponseEntity<DiaryEntry> createDiaryEntry(Principal principal, DiaryEntry diaryEntry) {
        log.debug("Controller: Creating new diary entry");

        diaryEntry.setUser(resolveCurrentUser(principal));

        DiaryEntry savedEntry = diaryService.save(diaryEntry);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedEntry);
    }

    @Override
    public ResponseEntity<DiaryEntry> updateDiaryEntry(Principal principal, UUID id, DiaryEntry diaryEntry) {
        log.debug("Controller: Updating diary entry with id: {}", id);

        // Get the existing entry to preserve createdAt
        DiaryEntry existingEntry = diaryService.findById(id);

        // Set the ID and preserve createdAt
        diaryEntry.setId(id);
        diaryEntry.setCreatedAt(existingEntry.getCreatedAt());
        diaryEntry.setUser(resolveCurrentUser(principal));

        DiaryEntry updatedEntry = diaryService.save(diaryEntry);

        return ResponseEntity.ok(updatedEntry);
    }

    @Override
    public ResponseEntity<Void> deleteDiaryEntry(UUID id) {
        log.debug("Controller: Deleting diary entry with id: {}", id);

        diaryService.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    private AppUser resolveCurrentUser(Principal principal) {
        return appUserRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("AppUser", "username", principal.getName()));
    }
}