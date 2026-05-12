package de.dermatrack.backend.exception;

import java.time.OffsetDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private OffsetDateTime timestamp;
    private int status;
    private String error;
    private String errorCode;
    private String message;
    private String path;
    private String traceId;
    private Map<String, String> validationErrors;
}
