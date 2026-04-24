package de.dermatrack.backend.diary.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import de.dermatrack.backend.auth.model.AppUser;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

@DisplayName("DiaryEntry Model Tests")
class DiaryEntryTest {

    private Validator validator;
    private DiaryEntry diaryEntry;
    private AppUser testUser;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        testUser = new AppUser();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");

        diaryEntry = new DiaryEntry();
        diaryEntry.setId(UUID.randomUUID());
        diaryEntry.setUser(testUser);
        diaryEntry.setCreatedAt(OffsetDateTime.now());
        diaryEntry.setEntryDate(LocalDate.of(2026, 4, 23));
    }

    @Test
    @DisplayName("Valid diary entry should have no validation errors")
    void validDiaryEntry_ShouldPassValidation() {
        diaryEntry.setStressLevel(7);
        diaryEntry.setSleep(6);
        diaryEntry.setMentalStrain(5);
        diaryEntry.setSymptomItchiness(4);
        diaryEntry.setSymptomInflammation(3);
        diaryEntry.setSymptomDryness(2);

        var violations = validator.validate(diaryEntry);

        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Stress level below 0 should fail validation")
    void stressLevel_BelowZero_ShouldFailValidation() {
        diaryEntry.setStressLevel(-1);

        var violations = validator.validate(diaryEntry);

        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Stress level must be 0 or higher");
    }

    @Test
    @DisplayName("Dryness above 10 should fail validation")
    void dryness_AboveTen_ShouldFailValidation() {
        diaryEntry.setSymptomDryness(11);

        var violations = validator.validate(diaryEntry);

        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Dryness rating must be 10 or lower");
    }

    @Test
    @DisplayName("Boundary values should pass validation")
    void rating_ValidRange_ShouldPassValidation() {
        diaryEntry.setStressLevel(0);
        diaryEntry.setSleep(10);
        diaryEntry.setMentalStrain(5);
        diaryEntry.setSymptomItchiness(10);
        diaryEntry.setSymptomInflammation(0);
        diaryEntry.setSymptomDryness(7);

        var violations = validator.validate(diaryEntry);

        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("getUserId() should return user's ID when user is set")
    void getUserId_WhenUserIsSet_ShouldReturnUserId() {
        UUID userId = diaryEntry.getUserId();

        assertThat(userId).isNotNull();
        assertThat(userId).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("getUserId() should return null when user is not set")
    void getUserId_WhenUserIsNull_ShouldReturnNull() {
        diaryEntry.setUser(null);

        UUID userId = diaryEntry.getUserId();

        assertThat(userId).isNull();
    }

    @Test
    @DisplayName("onCreate() should set createdAt if not already set")
    void onCreate_WhenCreatedAtIsNull_ShouldSetCreatedAt() {
        diaryEntry.setCreatedAt(null);
        OffsetDateTime beforeCall = OffsetDateTime.now();

        diaryEntry.onCreate();

        assertThat(diaryEntry.getCreatedAt()).isNotNull();
        assertThat(diaryEntry.getCreatedAt()).isAfterOrEqualTo(beforeCall);
    }

    @Test
    @DisplayName("onCreate() should not change createdAt if already set")
    void onCreate_WhenCreatedAtIsSet_ShouldNotChangeIt() {
        OffsetDateTime originalTime = OffsetDateTime.now().minusDays(1);
        diaryEntry.setCreatedAt(originalTime);

        diaryEntry.onCreate();

        assertThat(diaryEntry.getCreatedAt()).isEqualTo(originalTime);
    }

    @Test
    @DisplayName("All relevant fields should be properly set and retrieved")
    void allFields_ShouldBeProperlySetAndRetrieved() {
        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();
        LocalDate entryDate = LocalDate.of(2026, 4, 24);

        diaryEntry.setId(id);
        diaryEntry.setCreatedAt(createdAt);
        diaryEntry.setEntryDate(entryDate);
        diaryEntry.setStressLevel(1);
        diaryEntry.setSleep(2);
        diaryEntry.setMentalStrain(3);
        diaryEntry.setCustomContactFactors(List.of("dust"));
        diaryEntry.setCustomNutritionFactors(List.of("coffee"));
        diaryEntry.setCustomCareProducts(List.of("cream-a"));
        diaryEntry.setSymptomSpreadPhotoUrls(List.of("https://example.com/p1.jpg"));
        diaryEntry.setNotes("note");

        assertThat(diaryEntry.getId()).isEqualTo(id);
        assertThat(diaryEntry.getUser()).isEqualTo(testUser);
        assertThat(diaryEntry.getCreatedAt()).isEqualTo(createdAt);
        assertThat(diaryEntry.getEntryDate()).isEqualTo(entryDate);
        assertThat(diaryEntry.getStressLevel()).isEqualTo(1);
        assertThat(diaryEntry.getSleep()).isEqualTo(2);
        assertThat(diaryEntry.getMentalStrain()).isEqualTo(3);
        assertThat(diaryEntry.getCustomContactFactors()).containsExactly("dust");
        assertThat(diaryEntry.getCustomNutritionFactors()).containsExactly("coffee");
        assertThat(diaryEntry.getCustomCareProducts()).containsExactly("cream-a");
        assertThat(diaryEntry.getSymptomSpreadPhotoUrls()).containsExactly("https://example.com/p1.jpg");
        assertThat(diaryEntry.getNotes()).isEqualTo("note");
    }
}
