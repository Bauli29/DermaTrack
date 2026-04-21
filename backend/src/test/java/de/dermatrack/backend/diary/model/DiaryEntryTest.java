package de.dermatrack.backend.diary.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import de.dermatrack.backend.auth.model.AppUser;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

/**
 * Unit tests for DiaryEntry model
 */
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
    }

    @Test
    @DisplayName("Valid diary entry should have no validation errors")
    void validDiaryEntry_ShouldPassValidation() {
        // Arrange
        diaryEntry.setAllergies(5);
        diaryEntry.setInfections(3);
        diaryEntry.setStressLevel(7);
        diaryEntry.setSleep(6);
        diaryEntry.setNutrition(8);
        diaryEntry.setSymptoms(4);

        // Act
        var violations = validator.validate(diaryEntry);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Rating below 0 should fail validation")
    void rating_BelowZero_ShouldFailValidation() {
        // Arrange
        diaryEntry.setAllergies(-1);

        // Act
        var violations = validator.validate(diaryEntry);

        // Assert
        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Allergies rating must be 0 or higher");
    }

    @Test
    @DisplayName("Rating above 10 should fail validation")
    void rating_AboveTen_ShouldFailValidation() {
        // Arrange
        diaryEntry.setAllergies(11);

        // Act
        var violations = validator.validate(diaryEntry);

        // Assert
        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Allergies rating must be 10 or lower");
    }

    @Test
    @DisplayName("Rating between 0 and 10 should pass validation")
    void rating_ValidRange_ShouldPassValidation() {
        // Arrange - Alle 6 Felder haben identische @Min(0) @Max(10) Validierung
        diaryEntry.setAllergies(0);
        diaryEntry.setInfections(5);
        diaryEntry.setStressLevel(10);
        diaryEntry.setSleep(7);
        diaryEntry.setNutrition(8);
        diaryEntry.setSymptoms(3);

        // Act
        var violations = validator.validate(diaryEntry);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("getUserId() should return user's ID when user is set")
    void getUserId_WhenUserIsSet_ShouldReturnUserId() {
        // Act
        UUID userId = diaryEntry.getUserId();

        // Assert
        assertThat(userId).isNotNull();
        assertThat(userId).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("getUserId() should return null when user is not set")
    void getUserId_WhenUserIsNull_ShouldReturnNull() {
        // Arrange
        diaryEntry.setUser(null);

        // Act
        UUID userId = diaryEntry.getUserId();

        // Assert
        assertThat(userId).isNull();
    }

    @Test
    @DisplayName("onCreate() should set createdAt if not already set")
    void onCreate_WhenCreatedAtIsNull_ShouldSetCreatedAt() {
        // Arrange
        diaryEntry.setCreatedAt(null);
        OffsetDateTime beforeCall = OffsetDateTime.now();

        // Act
        diaryEntry.onCreate();

        // Assert
        assertThat(diaryEntry.getCreatedAt()).isNotNull();
        assertThat(diaryEntry.getCreatedAt()).isAfterOrEqualTo(beforeCall);
    }

    @Test
    @DisplayName("onCreate() should not change createdAt if already set")
    void onCreate_WhenCreatedAtIsSet_ShouldNotChangeIt() {
        // Arrange
        OffsetDateTime originalTime = OffsetDateTime.now().minusDays(1);
        diaryEntry.setCreatedAt(originalTime);

        // Act
        diaryEntry.onCreate();

        // Assert
        assertThat(diaryEntry.getCreatedAt()).isEqualTo(originalTime);
    }

    @Test
    @DisplayName("All fields should be properly set and retrieved")
    void allFields_ShouldBeProperlySetAndRetrieved() {
        // Arrange
        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();
        String miscText = "Test miscellaneous notes";

        // Act
        diaryEntry.setId(id);
        diaryEntry.setCreatedAt(createdAt);
        diaryEntry.setAllergies(1);
        diaryEntry.setInfections(2);
        diaryEntry.setStressLevel(3);
        diaryEntry.setSleep(4);
        diaryEntry.setNutrition(5);
        diaryEntry.setSymptoms(6);
        diaryEntry.setMiscellaneous(miscText);

        // Assert
        assertThat(diaryEntry.getId()).isEqualTo(id);
        assertThat(diaryEntry.getUser()).isEqualTo(testUser);
        assertThat(diaryEntry.getCreatedAt()).isEqualTo(createdAt);
        assertThat(diaryEntry.getAllergies()).isEqualTo(1);
        assertThat(diaryEntry.getInfections()).isEqualTo(2);
        assertThat(diaryEntry.getStressLevel()).isEqualTo(3);
        assertThat(diaryEntry.getSleep()).isEqualTo(4);
        assertThat(diaryEntry.getNutrition()).isEqualTo(5);
        assertThat(diaryEntry.getSymptoms()).isEqualTo(6);
        assertThat(diaryEntry.getMiscellaneous()).isEqualTo(miscText);
    }
}
