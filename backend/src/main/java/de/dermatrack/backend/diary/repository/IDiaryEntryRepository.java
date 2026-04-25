package de.dermatrack.backend.diary.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.dermatrack.backend.diary.model.DiaryEntry;

@Repository
public interface IDiaryEntryRepository extends JpaRepository<DiaryEntry, UUID> {

    // All basic CRUD operations are inherited from JpaRepository:

    // save(DiaryEntry) - Create/Update
    // findById(UUID) - Find by ID
    // findAll() - Get all entries
    // deleteById(UUID) - Delete by ID
    // existsById(UUID) - Check existence by ID

    List<DiaryEntry> findAllByUser_Id(UUID userId);

    Optional<DiaryEntry> findByIdAndUser_Id(UUID id, UUID userId);

    boolean existsByUser_IdAndEntryDate(UUID userId, LocalDate entryDate);

    boolean existsByUser_IdAndEntryDateAndIdNot(UUID userId, LocalDate entryDate, UUID id);

    List<DiaryEntry> findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(UUID userId, LocalDate fromDate,
            LocalDate toDate);
}