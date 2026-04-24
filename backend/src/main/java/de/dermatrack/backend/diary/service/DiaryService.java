package de.dermatrack.backend.diary.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import de.dermatrack.backend.exception.diary.DiaryEntryAlreadyExistsException;
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
        log.trace("Service: Saving diary entry: {}", diaryEntry.getId());
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
        log.trace("Service: Finding diary entry by id: {}", id);
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
        log.trace("Service: Finding all diary entries");
        return IDiaryEntryRepository.findAll();
    }

    /**
     * Delete diary entry by ID
     * 
     * @param id the UUID of the entry to delete
     * @throws ResourceNotFoundException if entry not found
     */
    public void deleteById(UUID id) {
        log.trace("Service: Deleting diary entry by id: {}", id);

        if (!IDiaryEntryRepository.existsById(id)) {
            throw new ResourceNotFoundException("DiaryEntry", "id", id);
        }

        IDiaryEntryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<DiaryEntry> findAllByUserId(UUID userId) {
        log.trace("Service: Finding all diary entries for user: {}", userId);
        return IDiaryEntryRepository.findAllByUser_Id(userId);
    }

    @Transactional(readOnly = true)
    public DiaryEntry findByIdAndUserId(UUID id, UUID userId) {
        log.trace("Service: Finding diary entry by id: {} and user: {}", id, userId);
        return IDiaryEntryRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("DiaryEntry", "id", id));
    }

    public DiaryEntry createForUser(DiaryEntry diaryEntry, UUID userId) {
        LocalDate entryDate = diaryEntry.getEntryDate();
        if (IDiaryEntryRepository.existsByUser_IdAndEntryDate(userId, entryDate)) {
            throw new DiaryEntryAlreadyExistsException(userId, entryDate);
        }
        return IDiaryEntryRepository.save(diaryEntry);
    }

    public DiaryEntry updateForUser(UUID id, UUID userId, DiaryEntry diaryEntry) {
        DiaryEntry existingEntry = findByIdAndUserId(id, userId);

        if (IDiaryEntryRepository.existsByUser_IdAndEntryDateAndIdNot(userId, diaryEntry.getEntryDate(), id)) {
            throw new DiaryEntryAlreadyExistsException(userId, diaryEntry.getEntryDate());
        }

        existingEntry.setEntryDate(diaryEntry.getEntryDate());
        existingEntry.setStressLevel(diaryEntry.getStressLevel());
        existingEntry.setSleep(diaryEntry.getSleep());
        existingEntry.setMentalStrain(diaryEntry.getMentalStrain());

        existingEntry.setContactShower(diaryEntry.getContactShower());
        existingEntry.setContactClothing(diaryEntry.getContactClothing());
        existingEntry.setContactAnimal(diaryEntry.getContactAnimal());
        existingEntry.setCustomContactFactors(diaryEntry.getCustomContactFactors());

        existingEntry.setNutritionNuts(diaryEntry.getNutritionNuts());
        existingEntry.setNutritionFruits(diaryEntry.getNutritionFruits());
        existingEntry.setNutritionShellfish(diaryEntry.getNutritionShellfish());
        existingEntry.setNutritionDairy(diaryEntry.getNutritionDairy());
        existingEntry.setNutritionGluten(diaryEntry.getNutritionGluten());
        existingEntry.setCustomNutritionFactors(diaryEntry.getCustomNutritionFactors());

        existingEntry.setCareSkinCare(diaryEntry.getCareSkinCare());
        existingEntry.setCareHairProducts(diaryEntry.getCareHairProducts());
        existingEntry.setCareSoapShampoo(diaryEntry.getCareSoapShampoo());
        existingEntry.setCareCosmetics(diaryEntry.getCareCosmetics());
        existingEntry.setCustomCareProducts(diaryEntry.getCustomCareProducts());

        existingEntry.setHealthOtherAllergies(diaryEntry.getHealthOtherAllergies());
        existingEntry.setHealthInfections(diaryEntry.getHealthInfections());

        existingEntry.setSymptomItchiness(diaryEntry.getSymptomItchiness());
        existingEntry.setSymptomScratch(diaryEntry.getSymptomScratch());
        existingEntry.setSymptomInflammation(diaryEntry.getSymptomInflammation());
        existingEntry.setSymptomDryness(diaryEntry.getSymptomDryness());
        existingEntry.setSymptomWeepingSkin(diaryEntry.getSymptomWeepingSkin());
        existingEntry.setSymptomSkinCracks(diaryEntry.getSymptomSkinCracks());
        existingEntry.setSymptomSpreadPhotoUrls(diaryEntry.getSymptomSpreadPhotoUrls());

        existingEntry.setNotes(diaryEntry.getNotes());

        return IDiaryEntryRepository.save(existingEntry);
    }

    public void deleteByIdAndUserId(UUID id, UUID userId) {
        DiaryEntry existingEntry = findByIdAndUserId(id, userId);
        IDiaryEntryRepository.delete(existingEntry);
    }

}