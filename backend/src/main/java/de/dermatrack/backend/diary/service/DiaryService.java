package de.dermatrack.backend.diary.service;

import de.dermatrack.backend.diary.api.model.DiaryEntry;
import de.dermatrack.backend.diary.api.repository.IDiaryEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service  // Spring annotation to denote a service component
@RequiredArgsConstructor // Lombok annotation to generate constructor for final fields
@Slf4j // Lombok annotation to generate a logger
@Transactional // Enable transaction management
public class DiaryService {

    private final IDiaryEntryRepository IDiaryEntryRepository;

    /**
     * Create or update a diary entry
     * @param diaryEntry the entry to save
     * @return the saved diary entry
     */
    public DiaryEntry save(DiaryEntry diaryEntry) {
        log.debug("Saving diary entry: {}", diaryEntry.getId());
        return IDiaryEntryRepository.save(diaryEntry);
    }

    /**
     * Find diary entry by ID
     * @param id the UUID of the entry
     * @return Optional containing the entry if found
     */
    @Transactional(readOnly = true)
    public Optional<DiaryEntry> findById(UUID id) {
        log.debug("Finding diary entry by id: {}", id);
        return IDiaryEntryRepository.findById(id);
    }

    /**
     * Get all diary entries
     * @return list of all diary entries
     */
    @Transactional(readOnly = true)
    public List<DiaryEntry> findAll() {
        log.debug("Finding all diary entries");
        return IDiaryEntryRepository.findAll();
    }

    /**
     * Delete diary entry by ID
     * @param id the UUID of the entry to delete
     */
    public void deleteById(UUID id) {
        log.debug("Deleting diary entry by id: {}", id);

        if (!IDiaryEntryRepository.existsById(id)) {
            throw new IllegalArgumentException("Diary entry not found with id: " + id);
        }

        IDiaryEntryRepository.deleteById(id);
    }

    /**
     * Check if diary entry exists by ID
     * @param id the UUID to check
     * @return true if entry exists, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean existsById(UUID id) {
        log.debug("Checking if diary entry exists by id: {}", id);
        return IDiaryEntryRepository.existsById(id);
    }
}