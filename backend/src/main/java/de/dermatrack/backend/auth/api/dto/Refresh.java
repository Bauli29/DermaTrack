package de.dermatrack.backend.auth.api.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Refresh {
    private String refreshToken;
}
