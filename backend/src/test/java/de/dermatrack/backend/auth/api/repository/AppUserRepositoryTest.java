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
        AppUser saved = appUserRepository.save(testUser);

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
        AppUser saved = appUserRepository.save(testUser);

        Optional<AppUser> found = appUserRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getUsername()).isEqualTo("testuser");
    }

    @Test
    @DisplayName("findById() should return empty when user does not exist")
    void findById_WhenUserDoesNotExist_ShouldReturnEmpty() {
        UUID nonExistentId = UUID.randomUUID();

        Optional<AppUser> found = appUserRepository.findById(nonExistentId);

        assertThat(found).isEmpty();
    }

    @Test
    void findByUsername_ShouldReturnCorrectUser() {
        appUserRepository.save(testUser);

        Optional<AppUser> found = appUserRepository.findByUsername("testuser");

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void findByUsername_WhenUserNotExists_ShouldReturnEmpty() {
        Optional<AppUser> found = appUserRepository.findByUsername("doesNotExist");

        assertThat(found).isEmpty();
    }

    @Test
    void savingMultipleUsers_ShouldKeepDataIsolated() {
        AppUser u1 = new AppUser();
        u1.setUsername("u12");
        u1.setEmail("u1@mail.com");
        u1.setPassword("password456");

        AppUser u2 = new AppUser();
        u2.setUsername("u23");
        u2.setEmail("u2@mail.com");
        u2.setPassword("password789");

        appUserRepository.save(u1);
        appUserRepository.save(u2);

        assertThat(appUserRepository.findAll()).hasSize(2);
    }

    @Test
    @DisplayName("findAll() should return all users")
    void findAll_ShouldReturnAllUsers() {
        appUserRepository.save(testUser);

        AppUser user2 = new AppUser();
        user2.setUsername("anotheruser");
        user2.setEmail("another@example.com");
        user2.setPassword("password456");
        appUserRepository.save(user2);

        List<AppUser> users = appUserRepository.findAll();

        assertThat(users).hasSize(2);
        assertThat(users)
                .extracting(AppUser::getUsername)
                .containsExactlyInAnyOrder("testuser", "anotheruser");
    }

    @Test
    @DisplayName("findAll() should return empty list when no users exist")
    void findAll_WhenNoUsers_ShouldReturnEmptyList() {
        List<AppUser> users = appUserRepository.findAll();

        assertThat(users).isEmpty();
    }

    @Test
    @DisplayName("deleteById() should remove user from database")
    void deleteById_ShouldRemoveUser() {
        AppUser saved = appUserRepository.save(testUser);

        appUserRepository.deleteById(saved.getId());

        assertThat(appUserRepository.findById(saved.getId())).isEmpty();
    }

    @Test
    @DisplayName("existsById() should return true when user exists")
    void existsById_WhenUserExists_ShouldReturnTrue() {
        AppUser saved = appUserRepository.save(testUser);

        boolean exists = appUserRepository.existsById(saved.getId());

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("existsById() should return false when user does not exist")
    void existsById_WhenUserDoesNotExist_ShouldReturnFalse() {
        UUID nonExistentId = UUID.randomUUID();

        boolean exists = appUserRepository.existsById(nonExistentId);

        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("save() should update existing user")
    void save_WhenUpdatingUser_ShouldUpdateFields() {
        AppUser saved = appUserRepository.save(testUser);
        UUID originalId = saved.getId();

        saved.setEmail("newemail@example.com");
        saved.setUsername("newusername");

        AppUser updated = appUserRepository.save(saved);

        assertThat(updated.getId()).isEqualTo(originalId);
        assertThat(updated.getEmail()).isEqualTo("newemail@example.com");
        assertThat(updated.getUsername()).isEqualTo("newusername");
        assertThat(updated.getUpdatedAt())
                .isAfterOrEqualTo(updated.getCreatedAt());
    }

    @Test
    @DisplayName("Username should be unique")
    void username_ShouldBeUnique() {
        appUserRepository.save(testUser);

        AppUser duplicateUser = new AppUser();
        duplicateUser.setUsername("testuser");
        duplicateUser.setEmail("different@example.com");
        duplicateUser.setPassword("password");

        appUserRepository.save(duplicateUser);

        try {
            appUserRepository.flush();
            assertThat(false).as("Expected constraint violation").isTrue();
        } catch (Exception e) {
            assertThat(e).isNotNull();
        }
    }

    @Test
    @DisplayName("Email should be unique")
    void email_ShouldBeUnique() {
        appUserRepository.save(testUser);

        AppUser duplicateUser = new AppUser();
        duplicateUser.setUsername("differentuser");
        duplicateUser.setEmail("test@example.com");
        duplicateUser.setPassword("password");

        appUserRepository.save(duplicateUser);

        try {
            appUserRepository.flush();
            assertThat(false).as("Expected constraint violation").isTrue();
        } catch (Exception e) {
            assertThat(e).isNotNull();
        }
    }
}
