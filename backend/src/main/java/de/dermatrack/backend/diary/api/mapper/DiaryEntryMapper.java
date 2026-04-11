package de.dermatrack.backend.diary.api.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import de.dermatrack.backend.diary.api.dto.DiaryEntryCreateRequest;
import de.dermatrack.backend.diary.api.dto.DiaryEntryResponse;
import de.dermatrack.backend.diary.api.dto.DiaryEntryUpdateRequest;
import de.dermatrack.backend.diary.api.model.DiaryEntry;

@Component
public class DiaryEntryMapper {

    public DiaryEntry toEntity(DiaryEntryCreateRequest request) {
        DiaryEntry entity = new DiaryEntry();
        entity.setAllergies(request.getAllergies());
        entity.setInfections(request.getInfections());
        entity.setStressLevel(request.getStressLevel());
        entity.setSleep(request.getSleep());
        entity.setNutrition(request.getNutrition());
        entity.setSymptoms(request.getSymptoms());
        entity.setMiscellaneous(request.getMiscellaneous());
        return entity;
    }

    public DiaryEntry toEntity(DiaryEntryUpdateRequest request) {
        DiaryEntry entity = new DiaryEntry();
        entity.setAllergies(request.getAllergies());
        entity.setInfections(request.getInfections());
        entity.setStressLevel(request.getStressLevel());
        entity.setSleep(request.getSleep());
        entity.setNutrition(request.getNutrition());
        entity.setSymptoms(request.getSymptoms());
        entity.setMiscellaneous(request.getMiscellaneous());
        return entity;
    }

    public DiaryEntryResponse toResponse(DiaryEntry entity) {
        return DiaryEntryResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .createdAt(entity.getCreatedAt())
                .allergies(entity.getAllergies())
                .infections(entity.getInfections())
                .stressLevel(entity.getStressLevel())
                .sleep(entity.getSleep())
                .nutrition(entity.getNutrition())
                .symptoms(entity.getSymptoms())
                .miscellaneous(entity.getMiscellaneous())
                .build();
    }

    public List<DiaryEntryResponse> toResponseList(List<DiaryEntry> entities) {
        return entities.stream().map(this::toResponse).toList();
    }
}
