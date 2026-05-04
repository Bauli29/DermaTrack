package de.dermatrack.backend.statistics.model.common;

import java.util.Arrays;
import java.util.Locale;

import lombok.Getter;

@Getter
public enum StatisticsPeriod {
    LAST_7_DAYS("7d", 7),
    LAST_30_DAYS("30d", 30),
    LAST_90_DAYS("90d", 90);

    private final String queryValue;
    private final int days;

    StatisticsPeriod(String queryValue, int days) {
        this.queryValue = queryValue;
        this.days = days;
    }

    public static StatisticsPeriod fromQueryValue(String queryValue) {
        if (queryValue == null || queryValue.isBlank()) {
            return LAST_7_DAYS;
        }

        String normalizedQueryValue = queryValue.trim().toLowerCase(Locale.ROOT);

        return Arrays.stream(values())
                .filter(period -> period.queryValue.equals(normalizedQueryValue))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unsupported statistics period. Supported values: 7d, 30d, 90d"));
    }
}
