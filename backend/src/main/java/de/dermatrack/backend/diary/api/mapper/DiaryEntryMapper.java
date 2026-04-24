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
        mapTrackingToEntity(request.getTracking(), entity);
        return entity;
    }

    public DiaryEntry toEntity(DiaryEntryUpdateRequest request) {
        DiaryEntry entity = new DiaryEntry();
        entity.setEntryDate(request.getEntryDate());
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
            entity.setContactClothing(tracking.getContactFactors().getClothing());
            entity.setContactAnimal(tracking.getContactFactors().getAnimalContact());
            entity.setCustomContactFactors(toMutableList(tracking.getContactFactors().getCustomContactFactors()));
        }

        if (tracking.getNutrition() != null) {
            entity.setNutritionNuts(tracking.getNutrition().getNuts());
            entity.setNutritionFruits(tracking.getNutrition().getFruits());
            entity.setNutritionShellfish(tracking.getNutrition().getShellfish());
            entity.setNutritionDairy(tracking.getNutrition().getDairy());
            entity.setNutritionGluten(tracking.getNutrition().getGluten());
            entity.setCustomNutritionFactors(toMutableList(tracking.getNutrition().getCustomNutritionFactors()));
        }

        if (tracking.getCareProducts() != null) {
            entity.setCareSkinCare(tracking.getCareProducts().getSkinCare());
            entity.setCareHairProducts(tracking.getCareProducts().getHairProducts());
            entity.setCareSoapShampoo(tracking.getCareProducts().getSoapShampoo());
            entity.setCareCosmetics(tracking.getCareProducts().getCosmetics());
            entity.setCustomCareProducts(toMutableList(tracking.getCareProducts().getCustomCareProducts()));
        }

        if (tracking.getHealth() != null) {
            entity.setHealthOtherAllergies(tracking.getHealth().getOtherAllergies());
            entity.setHealthInfections(tracking.getHealth().getInfections());
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
                entity.getContactClothing(),
                entity.getContactAnimal(),
                entity.getCustomContactFactors()));

        tracking.setNutrition(new NutritionDto(
                entity.getNutritionNuts(),
                entity.getNutritionFruits(),
                entity.getNutritionShellfish(),
                entity.getNutritionDairy(),
                entity.getNutritionGluten(),
                entity.getCustomNutritionFactors()));

        tracking.setCareProducts(new CareProductsDto(
                entity.getCareSkinCare(),
                entity.getCareHairProducts(),
                entity.getCareSoapShampoo(),
                entity.getCareCosmetics(),
                entity.getCustomCareProducts()));

        tracking.setHealth(new HealthDto(
                entity.getHealthOtherAllergies(),
                entity.getHealthInfections()));

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
