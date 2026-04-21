package de.dermatrack.backend.auth.api.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

import de.dermatrack.backend.auth.model.AppUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RegisterResponse {

    private UUID id;
    private String username;
    private String email;
    private OffsetDateTime createdAt;

    public static RegisterResponse fromUser(AppUser user) {
        return new RegisterResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt());
    }
}
