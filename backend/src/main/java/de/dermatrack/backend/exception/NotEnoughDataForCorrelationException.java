package de.dermatrack.backend.exception;

public class NotEnoughDataForCorrelationException extends RuntimeException {
    public NotEnoughDataForCorrelationException(String message) {
        super(message);
    }
}