package de.dermatrack.backend.diary.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.dermatrack.backend.diary.api.model.DiaryEntry;
import de.dermatrack.backend.diary.api.repository.IDiaryEntryRepository;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service // Spring annotation to denote a service component
@RequiredArgsConstructor // Lombok annotation to generate constructor for final fields
@Slf4j // Lombok annotation to generate a logger
@Transactional // Enable transaction management
public class DiaryService {

    private final IDiaryEntryRepository IDiaryEntryRepository;

    /**
     * Create or update a diary entry
     * 
     * @param diaryEntry the entry to save
     * @return the saved diary entry
     */
    public DiaryEntry save(DiaryEntry diaryEntry) {
        log.debug("Service: Saving diary entry: {}", diaryEntry.getId());
        return IDiaryEntryRepository.save(diaryEntry);
    }

    /**
     * Find diary entry by ID or throw exception
     * 
     * @param id the UUID of the entry
     * @return the diary entry
     * @throws ResourceNotFoundException if entry not found
     */
    @Transactional(readOnly = true)
    public DiaryEntry findById(UUID id) {
        log.debug("Service: Finding diary entry by id: {}", id);
        return IDiaryEntryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DiaryEntry", "id", id));
    }

    /**
     * Get all diary entries
     * 
     * @return list of all diary entries
     */
    @Transactional(readOnly = true)
    public List<DiaryEntry> findAll() {
        log.debug("Service: Finding all diary entries");
        return IDiaryEntryRepository.findAll();
    }

    /**
     * Delete diary entry by ID
     * 
     * @param id the UUID of the entry to delete
     * @throws ResourceNotFoundException if entry not found
     */
    public void deleteById(UUID id) {
        log.debug("Service: Deleting diary entry by id: {}", id);

        if (!IDiaryEntryRepository.existsById(id)) {
            throw new ResourceNotFoundException("DiaryEntry", "id", id);
        }

        IDiaryEntryRepository.deleteById(id);
    }

}