package de.dermatrack.backend.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.dermatrack.backend.auth.model.AppUser;

@Repository
public interface IAppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // All basic CRUD operations are inherited from JpaRepository:

    // save(User) - Create/Update
    // findById(UUID) - Find by ID
    // findAll() - Get all users
    // deleteById(UUID) - Delete by ID
    // existsById(UUID) - Check existence by ID
}
