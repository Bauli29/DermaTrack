package de.dermatrack.backend.dto;

import java.util.Map;

public class StatsResponse {
    private Map<String, Double> metrics;

    // Getters and setters
    public Map<String, Double> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, Double> metrics) {
        this.metrics = metrics;
    }
}