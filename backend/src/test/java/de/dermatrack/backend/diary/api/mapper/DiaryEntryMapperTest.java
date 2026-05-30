package de.dermatrack.backend.diary.api.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import de.dermatrack.backend.auth.model.AppUser;
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

@DisplayName("DiaryEntryMapper Unit Tests")
class DiaryEntryMapperTest {

    private final DiaryEntryMapper mapper = new DiaryEntryMapper();

    @Test
    @DisplayName("toEntity(createRequest) should map nested tracking payload")
    void toEntity_CreateRequest_ShouldMapTrackingPayload() {
        DiaryEntryCreateRequest request = new DiaryEntryCreateRequest();
        request.setEntryDate(LocalDate.of(2026, 4, 23));
        request.setTracking(buildTracking());

        DiaryEntry entity = mapper.toEntity(request);

        assertThat(entity.getEntryDate()).isEqualTo(LocalDate.of(2026, 4, 23));
        assertThat(entity.getStressLevel()).isEqualTo(7);
        assertThat(entity.getSleep()).isEqualTo(6);
        assertThat(entity.getMentalStrain()).isEqualTo(5);
        assertThat(entity.getContactShower()).isTrue();
        assertThat(entity.getContactShowerNotes()).isEqualTo("shower-note");
        assertThat(entity.getContactClothingNotes()).isEqualTo("cotton");
        assertThat(entity.getNutritionFruits()).isTrue();
        assertThat(entity.getNutritionFruitsNotes()).isEqualTo("yes");
        assertThat(entity.getCareSkinCare()).isTrue();
        assertThat(entity.getCareSkinCareNotes()).isEqualTo("basic");
        assertThat(entity.getHealthOtherAllergiesNotes()).isEqualTo("pollen");
        assertThat(entity.getSymptomItchiness()).isEqualTo(4);
        assertThat(entity.getSymptomSpreadPhotoUrls()).containsExactly("https://example.com/p1.jpg");
    }

    @Test
    @DisplayName("toResponse should map entity to nested tracking payload")
    void toResponse_ShouldMapEntityToTrackingPayload() {
        AppUser user = new AppUser();
        user.setId(UUID.randomUUID());

        DiaryEntry entity = new DiaryEntry();
        entity.setId(UUID.randomUUID());
        entity.setUser(user);
        entity.setCreatedAt(OffsetDateTime.parse("2026-04-23T10:15:30Z"));
        entity.setEntryDate(LocalDate.of(2026, 4, 23));
        entity.setStressLevel(8);
        entity.setSleep(7);
        entity.setMentalStrain(6);
        entity.setContactShower(true);
        entity.setContactShowerNotes("yes");
        entity.setContactClothing(true);
        entity.setContactClothingNotes("cotton");
        entity.setContactAnimal(false);
        entity.setContactAnimalNotes("none");
        entity.setCustomContactFactors(List.of("dust"));
        entity.setNutritionNuts(false);
        entity.setNutritionNutsNotes("no");
        entity.setNutritionFruits(true);
        entity.setNutritionFruitsNotes("yes");
        entity.setNutritionShellfish(false);
        entity.setNutritionShellfishNotes("no");
        entity.setNutritionDairy(true);
        entity.setNutritionDairyNotes("yes");
        entity.setNutritionGluten(false);
        entity.setNutritionGlutenNotes("no");
        entity.setCustomNutritionFactors(List.of("coffee"));
        entity.setCareSkinCare(true);
        entity.setCareSkinCareNotes("basic");
        entity.setCareHairProducts(false);
        entity.setCareHairProductsNotes("none");
        entity.setCareSoapShampoo(true);
        entity.setCareSoapShampooNotes("sensitive");
        entity.setCareCosmetics(false);
        entity.setCareCosmeticsNotes("none");
        entity.setCustomCareProducts(List.of("cream-a"));
        entity.setHealthOtherAllergies(true);
        entity.setHealthOtherAllergiesNotes("pollen");
        entity.setHealthInfections(false);
        entity.setHealthInfectionsNotes("none");
        entity.setSymptomItchiness(5);
        entity.setSymptomScratch(true);
        entity.setSymptomInflammation(4);
        entity.setSymptomDryness(3);
        entity.setSymptomWeepingSkin(false);
        entity.setSymptomSkinCracks(false);
        entity.setSymptomSpreadPhotoUrls(List.of("https://example.com/p1.jpg"));

        DiaryEntryResponse response = mapper.toResponse(entity);

        assertThat(response.getId()).isEqualTo(entity.getId());
        assertThat(response.getUserId()).isEqualTo(user.getId());
        assertThat(response.getCreatedAt()).isEqualTo(OffsetDateTime.parse("2026-04-23T10:15:30Z"));
        assertThat(response.getEntryDate()).isEqualTo(LocalDate.of(2026, 4, 23));
        assertThat(response.getTracking().getPsyche().getStressLevel()).isEqualTo(8);
        assertThat(response.getTracking().getContactFactors().getCustomContactFactors()).containsExactly("dust");
        assertThat(response.getTracking().getNutrition().getCustomNutritionFactors()).containsExactly("coffee");
        assertThat(response.getTracking().getCareProducts().getCustomCareProducts()).containsExactly("cream-a");
        assertThat(response.getTracking().getHealth().getOtherAllergiesNotes()).isEqualTo("pollen");
        assertThat(response.getTracking().getSymptoms().getSpreadPhotoUrls())
                .containsExactly("https://example.com/p1.jpg");
    }

    @Test
    @DisplayName("toEntity(createRequest) should tolerate missing tracking")
    void toEntity_CreateRequest_ShouldTolerateMissingTracking() {
        DiaryEntryCreateRequest request = new DiaryEntryCreateRequest();
        request.setEntryDate(LocalDate.of(2026, 5, 30));
        request.setNotes("minimal entry");

        DiaryEntry entity = mapper.toEntity(request);

        assertThat(entity.getEntryDate()).isEqualTo(LocalDate.of(2026, 5, 30));
        assertThat(entity.getNotes()).isEqualTo("minimal entry");
        assertThat(entity.getStressLevel()).isNull();
        assertThat(entity.getCustomContactFactors()).isEmpty();
    }

    @Test
    @DisplayName("toEntity(updateRequest) should map only present sections and default null lists")
    void toEntity_UpdateRequest_ShouldMapOnlyPresentSectionsAndDefaultNullLists() {
        DailyTrackingPayloadDto tracking = new DailyTrackingPayloadDto();
        tracking.setContactFactors(new ContactFactorsDto(true, null, false, null, true, null, null));
        tracking.setNutrition(new NutritionDto(null, null, null, null, null, null, null, null, null, null, null));
        tracking.setCareProducts(new CareProductsDto(null, null, null, null, null, null, null, null, null));
        tracking.setSymptoms(new SymptomsDto(1, false, 2, 3, false, true, null));

        DiaryEntryUpdateRequest request = new DiaryEntryUpdateRequest();
        request.setEntryDate(LocalDate.of(2026, 5, 31));
        request.setNotes("partial update");
        request.setTracking(tracking);

        DiaryEntry entity = mapper.toEntity(request);

        assertThat(entity.getEntryDate()).isEqualTo(LocalDate.of(2026, 5, 31));
        assertThat(entity.getNotes()).isEqualTo("partial update");
        assertThat(entity.getStressLevel()).isNull();
        assertThat(entity.getContactShower()).isTrue();
        assertThat(entity.getContactClothing()).isFalse();
        assertThat(entity.getContactAnimal()).isTrue();
        assertThat(entity.getCustomContactFactors()).isEmpty();
        assertThat(entity.getCustomNutritionFactors()).isEmpty();
        assertThat(entity.getCustomCareProducts()).isEmpty();
        assertThat(entity.getHealthOtherAllergies()).isNull();
        assertThat(entity.getSymptomItchiness()).isEqualTo(1);
        assertThat(entity.getSymptomSkinCracks()).isTrue();
        assertThat(entity.getSymptomSpreadPhotoUrls()).isEmpty();
    }

    @Test
    @DisplayName("toResponseList should map every entity")
    void toResponseList_ShouldMapEveryEntity() {
        DiaryEntry first = new DiaryEntry();
        first.setId(UUID.randomUUID());
        first.setEntryDate(LocalDate.of(2026, 5, 29));
        DiaryEntry second = new DiaryEntry();
        second.setId(UUID.randomUUID());
        second.setEntryDate(LocalDate.of(2026, 5, 30));

        List<DiaryEntryResponse> responses = mapper.toResponseList(List.of(first, second));

        assertThat(responses).extracting(DiaryEntryResponse::getId).containsExactly(first.getId(), second.getId());
        assertThat(responses).extracting(DiaryEntryResponse::getEntryDate)
                .containsExactly(LocalDate.of(2026, 5, 29), LocalDate.of(2026, 5, 30));
    }

    private DailyTrackingPayloadDto buildTracking() {
        DailyTrackingPayloadDto tracking = new DailyTrackingPayloadDto();
        tracking.setPsyche(new PsycheDto(7, 6, 5));
        tracking.setContactFactors(
                new ContactFactorsDto(true, "shower-note", true, "cotton", false, "none", List.of("dust")));
        tracking.setNutrition(
                new NutritionDto(false, "no", true, "yes", false, "no", true, "yes", false, "no", List.of("coffee")));
        tracking.setCareProducts(new CareProductsDto(true, "basic", false, "none", true, "sensitive", false, "none",
                List.of("cream-a")));
        tracking.setHealth(new HealthDto(true, "pollen", false, "none"));
        tracking.setSymptoms(new SymptomsDto(4, true, 3, 2, false, false,
                List.of("https://example.com/p1.jpg")));
        return tracking;
    }
}
