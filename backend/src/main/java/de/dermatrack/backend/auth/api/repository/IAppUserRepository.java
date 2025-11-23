package de.dermatrack.backend.auth.api.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.dermatrack.backend.auth.api.model.AppUser;

@Repository
public interface IAppUserRepository extends JpaRepository<AppUser, UUID> {

    // All basic CRUD operations are inherited from JpaRepository:

    // save(User) - Create/Update
    // findById(UUID) - Find by ID
    // findAll() - Get all users
    // deleteById(UUID) - Delete by ID
    // existsById(UUID) - Check existence by ID
}