package de.dermatrack.backend.diary.repository;

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
}