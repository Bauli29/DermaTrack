package de.dermatrack.backend.exception.diary;

import java.time.LocalDate;
import java.util.UUID;

public class DiaryEntryAlreadyExistsException extends RuntimeException {

    public DiaryEntryAlreadyExistsException(UUID userId, LocalDate entryDate) {
        super(String.format("DiaryEntry already exists for user '%s' on date '%s'", userId, entryDate));
    }
}
