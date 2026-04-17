package de.dermatrack.backend.auth.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.dermatrack.backend.auth.api.model.RefreshToken;

@Repository
public interface IRefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

    void deleteByUserId(UUID userId);
}
