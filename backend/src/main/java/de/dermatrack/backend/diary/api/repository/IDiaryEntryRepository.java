package de.dermatrack.backend.diary.api.repository;

import de.dermatrack.backend.diary.api.model.DiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface IDiaryEntryRepository extends JpaRepository<DiaryEntry, UUID> {

    // All basic CRUD operations are inherited from JpaRepository:

    // save(DiaryEntry) - Create/Update
    // findById(UUID) - Find by ID
    // findAll() - Get all entries
    // deleteById(UUID) - Delete by ID
    // existsById(UUID) - Check existence by ID
}