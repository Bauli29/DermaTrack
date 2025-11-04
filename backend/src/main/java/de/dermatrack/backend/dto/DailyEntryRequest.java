package de.dermatrack.backend.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class DailyEntryRequest {
    private LocalDate date;
    private Map<String, Integer> symptoms;
    private Map<String, Integer> factors;
    private List<PhotoPayload> photos;

    // Getters and setters
    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Map<String, Integer> getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(Map<String, Integer> symptoms) {
        this.symptoms = symptoms;
    }

    public Map<String, Integer> getFactors() {
        return factors;
    }

    public void setFactors(Map<String, Integer> factors) {
        this.factors = factors;
    }

    public List<PhotoPayload> getPhotos() {
        return photos;
    }

    public void setPhotos(List<PhotoPayload> photos) {
        this.photos = photos;
    }
}