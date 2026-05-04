package de.dermatrack.backend.diary.api.controller;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import de.dermatrack.backend.diary.api.dto.DiaryEntryCreateRequest;
import de.dermatrack.backend.diary.api.dto.DiaryEntryResponse;
import de.dermatrack.backend.diary.api.dto.DiaryEntryUpdateRequest;
import de.dermatrack.backend.diary.api.mapper.DiaryEntryMapper;
import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.service.DiaryService;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/diary")
@RequiredArgsConstructor
@Slf4j
public class DiaryController implements IDiaryController {

    private final DiaryService diaryService;
    private final IAppUserRepository appUserRepository;
    private final DiaryEntryMapper diaryEntryMapper;
    // Service handles all exceptions

    @GetMapping("/by-date")
    public ResponseEntity<DiaryEntryResponse> getByDate(
            Principal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        AppUser user = resolveCurrentUser(principal);
        log.info("User resolved: {}", user.getUsername());
        log.info("Searching diary for date: {}", date);
        try {
            DiaryEntry entry = diaryService.findByUserIdAndDate(user.getId(), date);
            return ResponseEntity.ok(diaryEntryMapper.toResponse(entry));
        } catch (ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @Override
    public ResponseEntity<List<DiaryEntryResponse>> getAllDiaryEntries(Principal principal) {
        log.trace("Controller: Getting all diary entries");

        AppUser currentUser = resolveCurrentUser(principal);
        List<DiaryEntry> entries = diaryService.findAllByUserId(currentUser.getId());

        return ResponseEntity.ok(diaryEntryMapper.toResponseList(entries));
    }

    @Override
    public ResponseEntity<DiaryEntryResponse> getDiaryEntryById(Principal principal, UUID id) {
        log.trace("Controller: Getting diary entry by id: {}", id);

        AppUser currentUser = resolveCurrentUser(principal);
        DiaryEntry entry = diaryService.findByIdAndUserId(id, currentUser.getId());

        return ResponseEntity.ok(diaryEntryMapper.toResponse(entry));
    }

    @Override
    public ResponseEntity<DiaryEntryResponse> createDiaryEntry(Principal principal, DiaryEntryCreateRequest request) {
        log.trace("Controller: Creating new diary entry");

        AppUser currentUser = resolveCurrentUser(principal);
        DiaryEntry diaryEntry = diaryEntryMapper.toEntity(request);

        diaryEntry.setUser(currentUser);

        DiaryEntry savedEntry = diaryService.createForUser(diaryEntry, currentUser.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(diaryEntryMapper.toResponse(savedEntry));
    }

    @Override
    public ResponseEntity<DiaryEntryResponse> updateDiaryEntry(Principal principal, UUID id,
            DiaryEntryUpdateRequest request) {
        log.trace("Controller: Updating diary entry with id: {}", id);

        AppUser currentUser = resolveCurrentUser(principal);
        DiaryEntry diaryEntry = diaryEntryMapper.toEntity(request);
        DiaryEntry updatedEntry = diaryService.updateForUser(id, currentUser.getId(), diaryEntry);

        return ResponseEntity.ok(diaryEntryMapper.toResponse(updatedEntry));
    }

    @Override
    public ResponseEntity<Void> deleteDiaryEntry(Principal principal, UUID id) {
        log.trace("Controller: Deleting diary entry with id: {}", id);

        AppUser currentUser = resolveCurrentUser(principal);
        diaryService.deleteByIdAndUserId(id, currentUser.getId());

        return ResponseEntity.noContent().build();
    }

    private AppUser resolveCurrentUser(Principal principal) {
        return appUserRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("AppUser", "username", principal.getName()));
    }
}