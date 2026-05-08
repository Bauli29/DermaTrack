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
        request.setTracking(buildTracking(7, 4, "pollen"));

        DiaryEntry entity = mapper.toEntity(request);

        assertThat(entity.getEntryDate()).isEqualTo(LocalDate.of(2026, 4, 23));
        assertThat(entity.getStressLevel()).isEqualTo(7);
        assertThat(entity.getSleep()).isEqualTo(6);
        assertThat(entity.getMentalStrain()).isEqualTo(5);
        assertThat(entity.getContactShower()).isEqualTo(true);
        assertThat(entity.getContactShowerNotes()).isEqualTo("shower-note");
        assertThat(entity.getContactClothingNotes()).isEqualTo("cotton");
        assertThat(entity.getNutritionFruits()).isEqualTo(true);
        assertThat(entity.getNutritionFruitsNotes()).isEqualTo("yes");
        assertThat(entity.getCareSkinCare()).isEqualTo(true);
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

    private DailyTrackingPayloadDto buildTracking(int stressLevel, int itchiness, String allergies) {
        DailyTrackingPayloadDto tracking = new DailyTrackingPayloadDto();
        tracking.setPsyche(new PsycheDto(stressLevel, 6, 5));
        tracking.setContactFactors(
                new ContactFactorsDto(true, "shower-note", true, "cotton", false, "none", List.of("dust")));
        tracking.setNutrition(
                new NutritionDto(false, "no", true, "yes", false, "no", true, "yes", false, "no", List.of("coffee")));
        tracking.setCareProducts(new CareProductsDto(true, "basic", false, "none", true, "sensitive", false, "none",
                List.of("cream-a")));
        tracking.setHealth(new HealthDto(true, allergies, false, "none"));
        tracking.setSymptoms(new SymptomsDto(itchiness, true, 3, 2, false, false,
                List.of("https://example.com/p1.jpg")));
        return tracking;
    }
}
