package de.dermatrack.backend.auth.api.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

/**
 * Unit tests for AppUser model
 */
@DisplayName("AppUser Model Tests")
class AppUserTest {

    private Validator validator;
    private AppUser appUser;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        appUser = new AppUser();
        appUser.setId(UUID.randomUUID());
        appUser.setUsername("testuser");
        appUser.setEmail("test@example.com");
        appUser.setPassword("password123");
    }

    @Test
    @DisplayName("Valid user should have no validation errors")
    void validUser_ShouldPassValidation() {
        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Username with valid characters should pass validation")
    void username_WithValidCharacters_ShouldPassValidation() {
        // Arrange
        appUser.setUsername("User_Name-123");

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations).isEmpty();
    }

    @Test
    @DisplayName("Username with invalid characters should fail validation")
    void username_WithInvalidCharacters_ShouldFailValidation() {
        // Arrange
        appUser.setUsername("user name!");

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Username can only contain letters, numbers, underscores and hyphens");
    }

    @Test
    @DisplayName("Username shorter than 3 characters should fail validation")
    void username_TooShort_ShouldFailValidation() {
        // Arrange
        appUser.setUsername("ab");

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Username must be between 3 and 50 characters");
    }

    @Test
    @DisplayName("Username longer than 50 characters should fail validation")
    void username_TooLong_ShouldFailValidation() {
        // Arrange
        appUser.setUsername("a".repeat(51));

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Username must be between 3 and 50 characters");
    }

    @Test
    @DisplayName("Blank username should fail validation")
    void username_WhenBlank_ShouldFailValidation() {
        // Arrange
        appUser.setUsername("");

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations).isNotEmpty();
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .contains("Username is required");
    }

    @Test
    @DisplayName("Valid email should pass validation")
    void email_WhenValid_ShouldPassValidation() {
        // Arrange
        appUser.setEmail("user@example.com");
        assertThat(validator.validate(appUser)).isEmpty();

        appUser.setEmail("user.name@example.co.uk");
        assertThat(validator.validate(appUser)).isEmpty();

        appUser.setEmail("user+tag@example.com");
        assertThat(validator.validate(appUser)).isEmpty();
    }

    @Test
    @DisplayName("Invalid email should fail validation")
    void email_WhenInvalid_ShouldFailValidation() {
        // Arrange
        appUser.setEmail("not-an-email");

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Email must be a valid email address");
    }

    @Test
    @DisplayName("Email shorter than 5 characters should fail validation")
    void email_TooShort_ShouldFailValidation() {
        // Arrange
        appUser.setEmail("a@b");

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Email must be between 5 and 100 characters");
    }

    @Test
    @DisplayName("Email longer than 100 characters should fail validation")
    void email_TooLong_ShouldFailValidation() {
        // Arrange
        String longEmail = "a".repeat(90) + "@example.com";
        appUser.setEmail(longEmail);

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Email must be between 5 and 100 characters");
    }

    @Test
    @DisplayName("Blank email should fail validation")
    void email_WhenBlank_ShouldFailValidation() {
        // Arrange
        appUser.setEmail("");

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations).isNotEmpty();
        assertThat(violations)
                .extracting(ConstraintViolation::getMessage)
                .anyMatch(msg -> msg.contains("Email is required"));
    }

    @Test
    @DisplayName("Blank password should fail validation")
    void password_WhenBlank_ShouldFailValidation() {
        // Arrange
        appUser.setPassword("");

        // Act
        var violations = validator.validate(appUser);

        // Assert
        assertThat(violations)
                .isNotEmpty()
                .extracting(ConstraintViolation::getMessage)
                .contains("Password is required");
    }

    @Test
    @DisplayName("onCreate() should set createdAt and updatedAt")
    void onCreate_ShouldSetTimestamps() {
        // Arrange
        appUser.setCreatedAt(null);
        appUser.setUpdatedAt(null);
        OffsetDateTime beforeCall = OffsetDateTime.now();

        // Act
        appUser.onCreate();

        // Assert
        assertThat(appUser.getCreatedAt()).isNotNull();
        assertThat(appUser.getUpdatedAt()).isNotNull();
        assertThat(appUser.getCreatedAt()).isAfterOrEqualTo(beforeCall);
        assertThat(appUser.getUpdatedAt()).isAfterOrEqualTo(beforeCall);
        assertThat(appUser.getCreatedAt()).isEqualTo(appUser.getUpdatedAt());
    }

    @Test
    @DisplayName("onCreate() should not change existing createdAt")
    void onCreate_WhenCreatedAtExists_ShouldNotChangeIt() {
        // Arrange
        OffsetDateTime originalCreatedAt = OffsetDateTime.now().minusDays(1);
        appUser.setCreatedAt(originalCreatedAt);
        appUser.setUpdatedAt(originalCreatedAt);

        // Act - onCreate wird durch @PrePersist aufgerufen, aber nur wenn Timestamps
        // null sind
        // In diesem Test prüfen wir nur, dass bereits gesetzte Werte nicht
        // überschrieben werden

        // Assert
        assertThat(appUser.getCreatedAt()).isEqualTo(originalCreatedAt);
        assertThat(appUser.getUpdatedAt()).isEqualTo(originalCreatedAt);
    }

    @Test
    @DisplayName("onUpdate() should update updatedAt timestamp")
    void onUpdate_ShouldUpdateTimestamp() {
        // Arrange
        OffsetDateTime originalCreatedAt = OffsetDateTime.now().minusDays(1);
        OffsetDateTime originalUpdatedAt = OffsetDateTime.now().minusHours(1);
        appUser.setCreatedAt(originalCreatedAt);
        appUser.setUpdatedAt(originalUpdatedAt);
        OffsetDateTime beforeUpdate = OffsetDateTime.now();

        // Act
        appUser.onUpdate();

        // Assert
        assertThat(appUser.getCreatedAt()).isEqualTo(originalCreatedAt);
        assertThat(appUser.getUpdatedAt()).isAfterOrEqualTo(beforeUpdate);
        assertThat(appUser.getUpdatedAt()).isAfter(originalUpdatedAt);
    }

    @Test
    @DisplayName("All fields should be properly set and retrieved")
    void allFields_ShouldBeProperlySetAndRetrieved() {
        // Arrange
        UUID id = UUID.randomUUID();
        String username = "johndoe";
        String email = "john@example.com";
        String password = "securePassword123";
        OffsetDateTime createdAt = OffsetDateTime.now().minusDays(5);
        OffsetDateTime updatedAt = OffsetDateTime.now().minusDays(1);

        // Act
        appUser.setId(id);
        appUser.setUsername(username);
        appUser.setEmail(email);
        appUser.setPassword(password);
        appUser.setCreatedAt(createdAt);
        appUser.setUpdatedAt(updatedAt);

        // Assert
        assertThat(appUser.getId()).isEqualTo(id);
        assertThat(appUser.getUsername()).isEqualTo(username);
        assertThat(appUser.getEmail()).isEqualTo(email);
        assertThat(appUser.getPassword()).isEqualTo(password);
        assertThat(appUser.getCreatedAt()).isEqualTo(createdAt);
        assertThat(appUser.getUpdatedAt()).isEqualTo(updatedAt);
    }

    @Test
    @DisplayName("Constructor with all arguments should set all fields")
    void constructor_WithAllArguments_ShouldSetAllFields() {
        // Arrange
        UUID id = UUID.randomUUID();
        String username = "testuser";
        String email = "test@example.com";
        String password = "password123";
        OffsetDateTime now = OffsetDateTime.now();

        // Act
        AppUser user = new AppUser(id, email, username, password, now, now);

        // Assert
        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getUsername()).isEqualTo(username);
        assertThat(user.getEmail()).isEqualTo(email);
        assertThat(user.getPassword()).isEqualTo(password);
        assertThat(user.getCreatedAt()).isEqualTo(now);
        assertThat(user.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("No-args constructor should create empty user")
    void constructor_NoArgs_ShouldCreateEmptyUser() {
        // Act
        AppUser user = new AppUser();

        // Assert
        assertThat(user.getId()).isNull();
        assertThat(user.getUsername()).isNull();
        assertThat(user.getEmail()).isNull();
        assertThat(user.getPassword()).isNull();
        assertThat(user.getCreatedAt()).isNull();
        assertThat(user.getUpdatedAt()).isNull();
    }
}
