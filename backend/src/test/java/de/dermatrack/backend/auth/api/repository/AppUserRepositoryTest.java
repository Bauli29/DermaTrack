package de.dermatrack.backend.auth.api.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import de.dermatrack.backend.auth.api.model.AppUser;

/**
 * Integration tests for AppUser Repository
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("AppUser Repository Tests")
class AppUserRepositoryTest {

    @Autowired
    private IAppUserRepository appUserRepository;

    private AppUser testUser;

    @BeforeEach
    void setUp() {
        testUser = new AppUser();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashedPassword123");
    }

    @Test
    @DisplayName("save() should persist user to database")
    void save_ShouldPersistUser() {
        // Act
        AppUser saved = appUserRepository.save(testUser);

        // Assert
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getUsername()).isEqualTo("testuser");
        assertThat(saved.getEmail()).isEqualTo("test@example.com");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("findById() should return user when exists")
    void findById_WhenUserExists_ShouldReturnUser() {
        // Arrange
        AppUser saved = appUserRepository.save(testUser);

        // Act
        Optional<AppUser> found = appUserRepository.findById(saved.getId());

        // Assert
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("findById() should return empty when user does not exist")
    void findById_WhenUserDoesNotExist_ShouldReturnEmpty() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();

        // Act
        Optional<AppUser> found = appUserRepository.findById(nonExistentId);

        // Assert
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("findAll() should return all users")
    void findAll_ShouldReturnAllUsers() {
        // Arrange
        appUserRepository.save(testUser);

        AppUser user2 = new AppUser();
        user2.setUsername("anotheruser");
        user2.setEmail("another@example.com");
        user2.setPassword("password456");
        appUserRepository.save(user2);

        // Act
        List<AppUser> users = appUserRepository.findAll();

        // Assert
        assertThat(users).hasSize(2);
        assertThat(users).extracting(AppUser::getUsername)
                .containsExactlyInAnyOrder("testuser", "anotheruser");
    }

    @Test
    @DisplayName("findAll() should return empty list when no users exist")
    void findAll_WhenNoUsers_ShouldReturnEmptyList() {
        // Act
        List<AppUser> users = appUserRepository.findAll();

        // Assert
        assertThat(users).isEmpty();
    }

    @Test
    @DisplayName("deleteById() should remove user from database")
    void deleteById_ShouldRemoveUser() {
        // Arrange
        AppUser saved = appUserRepository.save(testUser);

        // Act
        appUserRepository.deleteById(saved.getId());

        // Assert
        Optional<AppUser> found = appUserRepository.findById(saved.getId());
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("existsById() should return true when user exists")
    void existsById_WhenUserExists_ShouldReturnTrue() {
        // Arrange
        AppUser saved = appUserRepository.save(testUser);

        // Act
        boolean exists = appUserRepository.existsById(saved.getId());

        // Assert
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("existsById() should return false when user does not exist")
    void existsById_WhenUserDoesNotExist_ShouldReturnFalse() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();

        // Act
        boolean exists = appUserRepository.existsById(nonExistentId);

        // Assert
        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("save() should update existing user")
    void save_WhenUpdatingUser_ShouldUpdateFields() {
        // Arrange
        AppUser saved = appUserRepository.save(testUser);
        UUID originalId = saved.getId();

        // Act
        saved.setEmail("newemail@example.com");
        saved.setUsername("newusername");
        AppUser updated = appUserRepository.save(saved);

        // Assert
        assertThat(updated.getId()).isEqualTo(originalId);
        assertThat(updated.getEmail()).isEqualTo("newemail@example.com");
        assertThat(updated.getUsername()).isEqualTo("newusername");
        assertThat(updated.getUpdatedAt()).isAfterOrEqualTo(updated.getCreatedAt());
    }

    @Test
    @DisplayName("Username should be unique")
    void username_ShouldBeUnique() {
        // Arrange
        appUserRepository.save(testUser);

        AppUser duplicateUser = new AppUser();
        duplicateUser.setUsername("testuser"); // Same username
        duplicateUser.setEmail("different@example.com");
        duplicateUser.setPassword("password");

        // Act & Assert
        try {
            appUserRepository.save(duplicateUser);
            appUserRepository.flush();
            // If we reach here, test should fail
            assertThat(false).as("Expected exception for duplicate username").isTrue();
        } catch (Exception e) {
            // Expected: constraint violation
            assertThat(e).isNotNull();
        }
    }

    @Test
    @DisplayName("Email should be unique")
    void email_ShouldBeUnique() {
        // Arrange
        appUserRepository.save(testUser);

        AppUser duplicateUser = new AppUser();
        duplicateUser.setUsername("differentuser");
        duplicateUser.setEmail("test@example.com"); // Same email
        duplicateUser.setPassword("password");

        // Act & Assert
        try {
            appUserRepository.save(duplicateUser);
            appUserRepository.flush();
            // If we reach here, test should fail
            assertThat(false).as("Expected exception for duplicate email").isTrue();
        } catch (Exception e) {
            // Expected: constraint violation
            assertThat(e).isNotNull();
        }
    }

}
