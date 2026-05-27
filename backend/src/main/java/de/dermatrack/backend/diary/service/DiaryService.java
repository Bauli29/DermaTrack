package de.dermatrack.backend.diary.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;
import de.dermatrack.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service // Spring annotation to denote a service component
@RequiredArgsConstructor // Lombok annotation to generate constructor for final fields
@Slf4j // Lombok annotation to generate a logger
@Transactional // Enable transaction management
public class DiaryService {

    private static final String DIARY_ENTRY = "DiaryEntry";

    private final IDiaryEntryRepository IDiaryEntryRepository;

    @Lazy
    @Autowired
    private DiaryService diaryService;

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
                .orElseThrow(() -> new ResourceNotFoundException(DIARY_ENTRY, "id", id));
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
            throw new ResourceNotFoundException(DIARY_ENTRY, "id", id);
        }

        IDiaryEntryRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<DiaryEntry> findAllByUserId(UUID userId) {
        log.trace("Service: Finding all diary entries for user: {}", userId);
        return IDiaryEntryRepository.findAllByUser_Id(userId);
    }

    @Transactional(readOnly = true)
    public List<DiaryEntry> findAllByUserIdAndDateRange(UUID userId, LocalDate fromDate, LocalDate toDate) {
        log.trace("Service: Finding diary entries for user: {} between {} and {}", userId, fromDate, toDate);
        return IDiaryEntryRepository.findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, toDate);
    }

    @Transactional(readOnly = true)
    public DiaryEntry findByIdAndUserId(UUID id, UUID userId) {
        log.trace("Service: Finding diary entry by id: {} and user: {}", id, userId);
        return IDiaryEntryRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException(DIARY_ENTRY, "id", id));
    }

    public DiaryEntry createForUser(DiaryEntry diaryEntry, UUID userId) {
        LocalDate entryDate = diaryEntry.getEntryDate();
        return IDiaryEntryRepository
                .findByUser_IdAndEntryDate(userId, entryDate)
                .map(existing -> diaryService.updateForUser(existing.getId(), userId, diaryEntry))
                .orElseGet(() -> IDiaryEntryRepository.save(diaryEntry));
    }

    public DiaryEntry updateForUser(UUID id, UUID userId, DiaryEntry diaryEntry) {
        DiaryEntry existingEntry = diaryService.findByIdAndUserId(id, userId);

        existingEntry.setEntryDate(diaryEntry.getEntryDate());
        existingEntry.setStressLevel(diaryEntry.getStressLevel());
        existingEntry.setSleep(diaryEntry.getSleep());
        existingEntry.setMentalStrain(diaryEntry.getMentalStrain());

        existingEntry.setContactShower(diaryEntry.getContactShower());
        existingEntry.setContactShowerNotes(diaryEntry.getContactShowerNotes());
        existingEntry.setContactClothing(diaryEntry.getContactClothing());
        existingEntry.setContactClothingNotes(diaryEntry.getContactClothingNotes());
        existingEntry.setContactAnimal(diaryEntry.getContactAnimal());
        existingEntry.setContactAnimalNotes(diaryEntry.getContactAnimalNotes());
        existingEntry.setCustomContactFactors(diaryEntry.getCustomContactFactors());

        existingEntry.setNutritionNuts(diaryEntry.getNutritionNuts());
        existingEntry.setNutritionNutsNotes(diaryEntry.getNutritionNutsNotes());
        existingEntry.setNutritionFruits(diaryEntry.getNutritionFruits());
        existingEntry.setNutritionFruitsNotes(diaryEntry.getNutritionFruitsNotes());
        existingEntry.setNutritionShellfish(diaryEntry.getNutritionShellfish());
        existingEntry.setNutritionShellfishNotes(diaryEntry.getNutritionShellfishNotes());
        existingEntry.setNutritionDairy(diaryEntry.getNutritionDairy());
        existingEntry.setNutritionDairyNotes(diaryEntry.getNutritionDairyNotes());
        existingEntry.setNutritionGluten(diaryEntry.getNutritionGluten());
        existingEntry.setNutritionGlutenNotes(diaryEntry.getNutritionGlutenNotes());
        existingEntry.setCustomNutritionFactors(diaryEntry.getCustomNutritionFactors());

        existingEntry.setCareSkinCare(diaryEntry.getCareSkinCare());
        existingEntry.setCareSkinCareNotes(diaryEntry.getCareSkinCareNotes());
        existingEntry.setCareHairProducts(diaryEntry.getCareHairProducts());
        existingEntry.setCareHairProductsNotes(diaryEntry.getCareHairProductsNotes());
        existingEntry.setCareSoapShampoo(diaryEntry.getCareSoapShampoo());
        existingEntry.setCareSoapShampooNotes(diaryEntry.getCareSoapShampooNotes());
        existingEntry.setCareCosmetics(diaryEntry.getCareCosmetics());
        existingEntry.setCareCosmeticsNotes(diaryEntry.getCareCosmeticsNotes());
        existingEntry.setCustomCareProducts(diaryEntry.getCustomCareProducts());

        existingEntry.setHealthOtherAllergies(diaryEntry.getHealthOtherAllergies());
        existingEntry.setHealthOtherAllergiesNotes(diaryEntry.getHealthOtherAllergiesNotes());
        existingEntry.setHealthInfections(diaryEntry.getHealthInfections());
        existingEntry.setHealthInfectionsNotes(diaryEntry.getHealthInfectionsNotes());

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
        DiaryEntry existingEntry = diaryService.findByIdAndUserId(id, userId);
        IDiaryEntryRepository.delete(existingEntry);
    }

    @Transactional(readOnly = true)
    public DiaryEntry findByUserIdAndDate(UUID userId, LocalDate date) {
        log.trace("Service: Finding diary entry for user {} on date {}", userId, date);

        return IDiaryEntryRepository
                .findByUser_IdAndEntryDate(userId, date)
                .orElseThrow(() -> new ResourceNotFoundException(
                        DIARY_ENTRY,
                        "entryDate",
                        date));
    }

}
