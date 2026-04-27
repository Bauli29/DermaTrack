package de.dermatrack.backend.diary.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
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

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;
import de.dermatrack.backend.exception.ResourceNotFoundException;

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
        testEntry.setEntryDate(LocalDate.of(2026, 4, 23));
        testEntry.setStressLevel(7);
        testEntry.setSleep(6);
        testEntry.setMentalStrain(5);
        testEntry.setSymptomItchiness(4);
    }

    @Test
    @DisplayName("save() should successfully save diary entry")
    void save_ShouldSaveDiaryEntry() {
        when(diaryEntryRepository.save(any(DiaryEntry.class))).thenReturn(testEntry);

        DiaryEntry result = diaryService.save(testEntry);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testId);
        assertThat(result.getStressLevel()).isEqualTo(7);
        verify(diaryEntryRepository).save(testEntry);
    }

    @Test
    @DisplayName("findById() should return diary entry when it exists")
    void findById_WhenEntryExists_ShouldReturnEntry() {
        when(diaryEntryRepository.findById(testId)).thenReturn(Optional.of(testEntry));

        DiaryEntry result = diaryService.findById(testId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(testId);
        assertThat(result.getUser()).isEqualTo(testUser);
        verify(diaryEntryRepository).findById(testId);
    }

    @Test
    @DisplayName("findById() should throw ResourceNotFoundException when entry does not exist")
    void findById_WhenEntryDoesNotExist_ShouldThrowException() {
        UUID nonExistentId = UUID.randomUUID();
        when(diaryEntryRepository.findById(nonExistentId)).thenReturn(Optional.empty());

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
        DiaryEntry entry2 = new DiaryEntry();
        entry2.setId(UUID.randomUUID());
        entry2.setUser(testUser);
        List<DiaryEntry> entries = List.of(testEntry, entry2);

        when(diaryEntryRepository.findAll()).thenReturn(entries);

        List<DiaryEntry> result = diaryService.findAll();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testEntry, entry2);
        verify(diaryEntryRepository).findAll();
    }

    @Test
    @DisplayName("findAll() should return empty list when no entries exist")
    void findAll_WhenNoEntries_ShouldReturnEmptyList() {
        when(diaryEntryRepository.findAll()).thenReturn(List.of());

        List<DiaryEntry> result = diaryService.findAll();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(diaryEntryRepository).findAll();
    }

    @Test
    @DisplayName("deleteById() should successfully delete diary entry when it exists")
    void deleteById_WhenEntryExists_ShouldDeleteEntry() {
        when(diaryEntryRepository.existsById(testId)).thenReturn(true);

        diaryService.deleteById(testId);

        verify(diaryEntryRepository).existsById(testId);
        verify(diaryEntryRepository).deleteById(testId);
    }

    @Test
    @DisplayName("deleteById() should throw ResourceNotFoundException when entry does not exist")
    void deleteById_WhenEntryDoesNotExist_ShouldThrowException() {
        UUID nonExistentId = UUID.randomUUID();
        when(diaryEntryRepository.existsById(nonExistentId)).thenReturn(false);

        assertThatThrownBy(() -> diaryService.deleteById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("DiaryEntry")
                .hasMessageContaining("id")
                .hasMessageContaining(nonExistentId.toString());

        verify(diaryEntryRepository).existsById(nonExistentId);
        verify(diaryEntryRepository, never()).deleteById(any(UUID.class));
    }

    /*
     * @Test
     * 
     * @DisplayName("createForUser() should throw conflict when entry exists for same user/date"
     * )
     * void createForUser_WhenDuplicateDate_ShouldThrowConflict() {
     * UUID userId = testUser.getId();
     * LocalDate entryDate = testEntry.getEntryDate();
     * when(diaryEntryRepository.existsByUser_IdAndEntryDate(userId,
     * entryDate)).thenReturn(true);
     * 
     * assertThatThrownBy(() -> diaryService.createForUser(testEntry, userId))
     * .isInstanceOf(DiaryEntryAlreadyExistsException.class);
     * 
     * verify(diaryEntryRepository).existsByUser_IdAndEntryDate(userId, entryDate);
     * verify(diaryEntryRepository, never()).save(any(DiaryEntry.class));
     * }
     */

    @Test
    @DisplayName("findAllByUserId() should return owner-scoped entries")
    void findAllByUserId_ShouldReturnOwnerEntries() {
        UUID userId = testUser.getId();
        List<DiaryEntry> entries = List.of(testEntry);
        when(diaryEntryRepository.findAllByUser_Id(userId)).thenReturn(entries);

        List<DiaryEntry> result = diaryService.findAllByUserId(userId);

        assertThat(result).containsExactly(testEntry);
        verify(diaryEntryRepository).findAllByUser_Id(userId);
    }

    @Test
    @DisplayName("findByIdAndUserId() should return entry when it belongs to owner")
    void findByIdAndUserId_WhenOwned_ShouldReturnEntry() {
        UUID userId = testUser.getId();
        when(diaryEntryRepository.findByIdAndUser_Id(testId, userId)).thenReturn(Optional.of(testEntry));

        DiaryEntry result = diaryService.findByIdAndUserId(testId, userId);

        assertThat(result).isEqualTo(testEntry);
        verify(diaryEntryRepository).findByIdAndUser_Id(testId, userId);
    }

    @Test
    @DisplayName("createForUser() should save when no entry exists on that date")
    void createForUser_WhenDateIsFree_ShouldSave() {
        UUID userId = testUser.getId();
        LocalDate entryDate = testEntry.getEntryDate();
        when(diaryEntryRepository.findByUser_IdAndEntryDate(userId, entryDate)).thenReturn(Optional.empty());
        when(diaryEntryRepository.save(testEntry)).thenReturn(testEntry);

        DiaryEntry result = diaryService.createForUser(testEntry, userId);

        assertThat(result).isEqualTo(testEntry);
        verify(diaryEntryRepository).findByUser_IdAndEntryDate(userId, entryDate);
        verify(diaryEntryRepository).save(testEntry);
    }

    @Test
    @DisplayName("findByIdAndUserId() should throw not found when entry belongs to another user")
    void findByIdAndUserId_WhenNotOwned_ShouldThrowNotFound() {
        UUID anotherUserId = UUID.randomUUID();
        when(diaryEntryRepository.findByIdAndUser_Id(testId, anotherUserId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> diaryService.findByIdAndUserId(testId, anotherUserId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("DiaryEntry");

        verify(diaryEntryRepository).findByIdAndUser_Id(testId, anotherUserId);
    }

    /*
     * @Test
     * 
     * @DisplayName("updateForUser() should throw conflict when another entry already uses target date"
     * )
     * void updateForUser_WhenDateAlreadyTaken_ShouldThrowConflict() {
     * UUID userId = testUser.getId();
     * when(diaryEntryRepository.findByIdAndUser_Id(testId,
     * userId)).thenReturn(Optional.of(testEntry));
     * when(diaryEntryRepository.existsByUser_IdAndEntryDateAndIdNot(userId,
     * testEntry.getEntryDate(), testId))
     * .thenReturn(true);
     * 
     * assertThatThrownBy(() -> diaryService.updateForUser(testId, userId,
     * testEntry))
     * .isInstanceOf(DiaryEntryAlreadyExistsException.class);
     * 
     * verify(diaryEntryRepository).findByIdAndUser_Id(testId, userId);
     * verify(diaryEntryRepository).existsByUser_IdAndEntryDateAndIdNot(userId,
     * testEntry.getEntryDate(), testId);
     * verify(diaryEntryRepository, never()).save(any(DiaryEntry.class));
     * }
     */

    @Test
    @DisplayName("updateForUser() should preserve owner and createdAt when update is valid")
    void updateForUser_WhenValid_ShouldPreserveOwnerAndCreatedAt() {
        UUID userId = testUser.getId();
        OffsetDateTime originalCreatedAt = OffsetDateTime.now().minusDays(1);
        testEntry.setCreatedAt(originalCreatedAt);

        DiaryEntry updateRequest = new DiaryEntry();
        updateRequest.setEntryDate(LocalDate.of(2026, 4, 24));
        updateRequest.setStressLevel(9);

        when(diaryEntryRepository.findByIdAndUser_Id(testId, userId)).thenReturn(Optional.of(testEntry));
        when(diaryEntryRepository.save(testEntry)).thenReturn(testEntry);

        DiaryEntry result = diaryService.updateForUser(testId, userId, updateRequest);

        assertThat(result.getId()).isEqualTo(testId);
        assertThat(result.getUser()).isEqualTo(testUser);
        assertThat(result.getCreatedAt()).isEqualTo(originalCreatedAt);
        assertThat(result.getEntryDate()).isEqualTo(LocalDate.of(2026, 4, 24));
        assertThat(result.getStressLevel()).isEqualTo(9);
        verify(diaryEntryRepository).save(testEntry);
    }

    @Test
    @DisplayName("deleteByIdAndUserId() should delete when entry belongs to user")
    void deleteByIdAndUserId_WhenOwned_ShouldDelete() {
        UUID userId = testUser.getId();
        when(diaryEntryRepository.findByIdAndUser_Id(testId, userId)).thenReturn(Optional.of(testEntry));

        diaryService.deleteByIdAndUserId(testId, userId);

        verify(diaryEntryRepository).findByIdAndUser_Id(testId, userId);
        verify(diaryEntryRepository).delete(testEntry);
    }
}
