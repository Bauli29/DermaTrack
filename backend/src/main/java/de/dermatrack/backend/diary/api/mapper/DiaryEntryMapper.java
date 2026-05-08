package de.dermatrack.backend.diary.api.mapper;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import de.dermatrack.backend.diary.api.dto.CareProductsDto;
import de.dermatrack.backend.diary.api.dto.ContactFactorsDto;
import de.dermatrack.backend.diary.api.dto.DailyTrackingPayloadDto;
import de.dermatrack.backend.diary.api.dto.DiaryEntryCreateRequest;
import de.dermatrack.backend.diary.api.dto.DiaryEntryResponse;
import de.dermatrack.backend.diary.api.dto.DiaryEntryUpdateRequest;
import de.dermatrack.backend.diary.api.dto.HealthDto;
import de.dermatrack.backend.diary.api.dto.NutritionDto;
import de.dermatrack.backend.diary.api.dto.PsycheDto;
import de.dermatrack.backend.diary.api.dto.SymptomsDto;
import de.dermatrack.backend.diary.model.DiaryEntry;

@Component
public class DiaryEntryMapper {

    public DiaryEntry toEntity(DiaryEntryCreateRequest request) {
        DiaryEntry entity = new DiaryEntry();
        entity.setEntryDate(request.getEntryDate());
        entity.setNotes(request.getNotes());
        mapTrackingToEntity(request.getTracking(), entity);
        return entity;
    }

    public DiaryEntry toEntity(DiaryEntryUpdateRequest request) {
        DiaryEntry entity = new DiaryEntry();
        entity.setEntryDate(request.getEntryDate());
        entity.setNotes(request.getNotes());
        mapTrackingToEntity(request.getTracking(), entity);
        return entity;
    }

    public DiaryEntryResponse toResponse(DiaryEntry entity) {
        DiaryEntryResponse response = new DiaryEntryResponse();
        response.setId(entity.getId());
        response.setUserId(entity.getUserId());
        response.setCreatedAt(entity.getCreatedAt());
        response.setEntryDate(entity.getEntryDate());
        response.setTracking(mapEntityToTracking(entity));
        response.setNotes(entity.getNotes());
        return response;
    }

    public List<DiaryEntryResponse> toResponseList(List<DiaryEntry> entities) {
        return entities.stream().map(this::toResponse).toList();
    }

    private void mapTrackingToEntity(DailyTrackingPayloadDto tracking, DiaryEntry entity) {
        if (tracking == null) {
            return;
        }

        if (tracking.getPsyche() != null) {
            entity.setStressLevel(tracking.getPsyche().getStressLevel());
            entity.setSleep(tracking.getPsyche().getSleep());
            entity.setMentalStrain(tracking.getPsyche().getMentalStrain());
        }

        if (tracking.getContactFactors() != null) {
            entity.setContactShower(tracking.getContactFactors().getShower());
            entity.setContactShowerNotes(tracking.getContactFactors().getShowerNotes());
            entity.setContactClothing(tracking.getContactFactors().getClothing());
            entity.setContactClothingNotes(tracking.getContactFactors().getClothingNotes());
            entity.setContactAnimal(tracking.getContactFactors().getAnimalContact());
            entity.setContactAnimalNotes(tracking.getContactFactors().getAnimalContactNotes());
            entity.setCustomContactFactors(toMutableList(tracking.getContactFactors().getCustomContactFactors()));
        }

        if (tracking.getNutrition() != null) {
            entity.setNutritionNuts(tracking.getNutrition().getNuts());
            entity.setNutritionNutsNotes(tracking.getNutrition().getNutsNotes());
            entity.setNutritionFruits(tracking.getNutrition().getFruits());
            entity.setNutritionFruitsNotes(tracking.getNutrition().getFruitsNotes());
            entity.setNutritionShellfish(tracking.getNutrition().getShellfish());
            entity.setNutritionShellfishNotes(tracking.getNutrition().getShellfishNotes());
            entity.setNutritionDairy(tracking.getNutrition().getDairy());
            entity.setNutritionDairyNotes(tracking.getNutrition().getDairyNotes());
            entity.setNutritionGluten(tracking.getNutrition().getGluten());
            entity.setNutritionGlutenNotes(tracking.getNutrition().getGlutenNotes());
            entity.setCustomNutritionFactors(toMutableList(tracking.getNutrition().getCustomNutritionFactors()));
        }

        if (tracking.getCareProducts() != null) {
            entity.setCareSkinCare(tracking.getCareProducts().getSkinCare());
            entity.setCareSkinCareNotes(tracking.getCareProducts().getSkinCareNotes());
            entity.setCareHairProducts(tracking.getCareProducts().getHairProducts());
            entity.setCareHairProductsNotes(tracking.getCareProducts().getHairProductsNotes());
            entity.setCareSoapShampoo(tracking.getCareProducts().getSoapShampoo());
            entity.setCareSoapShampooNotes(tracking.getCareProducts().getSoapShampooNotes());
            entity.setCareCosmetics(tracking.getCareProducts().getCosmetics());
            entity.setCareCosmeticsNotes(tracking.getCareProducts().getCosmeticsNotes());
            entity.setCustomCareProducts(toMutableList(tracking.getCareProducts().getCustomCareProducts()));
        }

        if (tracking.getHealth() != null) {
            entity.setHealthOtherAllergies(tracking.getHealth().getOtherAllergies());
            entity.setHealthOtherAllergiesNotes(tracking.getHealth().getOtherAllergiesNotes());
            entity.setHealthInfections(tracking.getHealth().getInfections());
            entity.setHealthInfectionsNotes(tracking.getHealth().getInfectionsNotes());
        }

        if (tracking.getSymptoms() != null) {
            entity.setSymptomItchiness(tracking.getSymptoms().getItchiness());
            entity.setSymptomScratch(tracking.getSymptoms().getScratch());
            entity.setSymptomInflammation(tracking.getSymptoms().getInflammation());
            entity.setSymptomDryness(tracking.getSymptoms().getDryness());
            entity.setSymptomWeepingSkin(tracking.getSymptoms().getWeepingSkin());
            entity.setSymptomSkinCracks(tracking.getSymptoms().getSkinCracks());
            entity.setSymptomSpreadPhotoUrls(toMutableList(tracking.getSymptoms().getSpreadPhotoUrls()));
        }
    }

    private List<String> toMutableList(List<String> source) {
        return source == null ? new ArrayList<>() : new ArrayList<>(source);
    }

    private DailyTrackingPayloadDto mapEntityToTracking(DiaryEntry entity) {
        DailyTrackingPayloadDto tracking = new DailyTrackingPayloadDto();

        tracking.setPsyche(new PsycheDto(
                entity.getStressLevel(),
                entity.getSleep(),
                entity.getMentalStrain()));

        tracking.setContactFactors(new ContactFactorsDto(
                entity.getContactShower(),
                entity.getContactShowerNotes(),
                entity.getContactClothing(),
                entity.getContactClothingNotes(),
                entity.getContactAnimal(),
                entity.getContactAnimalNotes(),
                entity.getCustomContactFactors()));

        tracking.setNutrition(new NutritionDto(
                entity.getNutritionNuts(),
                entity.getNutritionNutsNotes(),
                entity.getNutritionFruits(),
                entity.getNutritionFruitsNotes(),
                entity.getNutritionShellfish(),
                entity.getNutritionShellfishNotes(),
                entity.getNutritionDairy(),
                entity.getNutritionDairyNotes(),
                entity.getNutritionGluten(),
                entity.getNutritionGlutenNotes(),
                entity.getCustomNutritionFactors()));

        tracking.setCareProducts(new CareProductsDto(
                entity.getCareSkinCare(),
                entity.getCareSkinCareNotes(),
                entity.getCareHairProducts(),
                entity.getCareHairProductsNotes(),
                entity.getCareSoapShampoo(),
                entity.getCareSoapShampooNotes(),
                entity.getCareCosmetics(),
                entity.getCareCosmeticsNotes(),
                entity.getCustomCareProducts()));

        tracking.setHealth(new HealthDto(
                entity.getHealthOtherAllergies(),
                entity.getHealthOtherAllergiesNotes(),
                entity.getHealthInfections(),
                entity.getHealthInfectionsNotes()));

        tracking.setSymptoms(new SymptomsDto(
                entity.getSymptomItchiness(),
                entity.getSymptomScratch(),
                entity.getSymptomInflammation(),
                entity.getSymptomDryness(),
                entity.getSymptomWeepingSkin(),
                entity.getSymptomSkinCracks(),
                entity.getSymptomSpreadPhotoUrls()));

        return tracking;
    }
}
