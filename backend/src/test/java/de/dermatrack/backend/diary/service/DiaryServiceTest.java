package de.dermatrack.backend.diary.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import de.dermatrack.backend.auth.api.model.AppUser;
import de.dermatrack.backend.diary.api.model.DiaryEntry;
import de.dermatrack.backend.diary.api.repository.IDiaryEntryRepository;
import de.dermatrack.backend.exception.ResourceNotFoundException;

/**
 * Unit tests for DiaryService
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DiaryService Unit Tests")
class DiaryServiceTest {

    @Mock
    private IDiaryEntryRepository diaryEntryRepository;

    @InjectMocks
    private DiaryService diaryService;

    private DiaryEntry testEntry;
    private AppUser testUser;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        testUser = new AppUser();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");

        testEntry = new DiaryEntry();
        testEntry.setId(testId);
        testEntry.setUser(testUser);
        testEntry.setCreatedAt(OffsetDateTime.now());
        testEntry.setAllergies(5);
        testEntry.setInfections(3);
        testEntry.setStressLevel(7);
        testEntry.setSleep(6);
        testEntry.setNutrition(8);
        testEntry.setSymptoms(4);
        testEntry.setMiscellaneous("Test notes");
    }

    @Test
    @DisplayName("save() should successfully save diary entry")
    void save_ShouldSaveDiaryEntry() {
        // Arrange
        when(diaryEntryRepository.save(any(DiaryEntry.class))).thenReturn(testEntry);

        // Act
        DiaryEntry result = diaryService.save(testEntry);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testId);
        assertThat(result.getAllergies()).isEqualTo(5);
        verify(diaryEntryRepository).save(testEntry);
    }

    @Test
    @DisplayName("findById() should return diary entry when it exists")
    void findById_WhenEntryExists_ShouldReturnEntry() {
        // Arrange
        when(diaryEntryRepository.findById(testId)).thenReturn(Optional.of(testEntry));

        // Act
        DiaryEntry result = diaryService.findById(testId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testId);
        assertThat(result.getUser()).isEqualTo(testUser);
        verify(diaryEntryRepository).findById(testId);
    }

    @Test
    @DisplayName("findById() should throw ResourceNotFoundException when entry does not exist")
    void findById_WhenEntryDoesNotExist_ShouldThrowException() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(diaryEntryRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> diaryService.findById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("DiaryEntry")
                .hasMessageContaining("id")
                .hasMessageContaining(nonExistentId.toString());

        verify(diaryEntryRepository).findById(nonExistentId);
    }

    @Test
    @DisplayName("findAll() should return list of all diary entries")
    void findAll_ShouldReturnAllEntries() {
        // Arrange
        DiaryEntry entry2 = new DiaryEntry();
        entry2.setId(UUID.randomUUID());
        entry2.setUser(testUser);
        List<DiaryEntry> entries = List.of(testEntry, entry2);

        when(diaryEntryRepository.findAll()).thenReturn(entries);

        // Act
        List<DiaryEntry> result = diaryService.findAll();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testEntry, entry2);
        verify(diaryEntryRepository).findAll();
    }

    @Test
    @DisplayName("findAll() should return empty list when no entries exist")
    void findAll_WhenNoEntries_ShouldReturnEmptyList() {
        // Arrange
        when(diaryEntryRepository.findAll()).thenReturn(List.of());

        // Act
        List<DiaryEntry> result = diaryService.findAll();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(diaryEntryRepository).findAll();
    }

    @Test
    @DisplayName("deleteById() should successfully delete diary entry when it exists")
    void deleteById_WhenEntryExists_ShouldDeleteEntry() {
        // Arrange
        when(diaryEntryRepository.existsById(testId)).thenReturn(true);

        // Act
        diaryService.deleteById(testId);

        // Assert
        verify(diaryEntryRepository).existsById(testId);
        verify(diaryEntryRepository).deleteById(testId);
    }

    @Test
    @DisplayName("deleteById() should throw ResourceNotFoundException when entry does not exist")
    void deleteById_WhenEntryDoesNotExist_ShouldThrowException() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(diaryEntryRepository.existsById(nonExistentId)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> diaryService.deleteById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("DiaryEntry")
                .hasMessageContaining("id")
                .hasMessageContaining(nonExistentId.toString());

        verify(diaryEntryRepository).existsById(nonExistentId);
        verify(diaryEntryRepository, never()).deleteById(any(UUID.class));
    }
}
