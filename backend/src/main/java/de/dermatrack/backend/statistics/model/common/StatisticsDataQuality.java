package de.dermatrack.backend.statistics.model.common;

import java.util.List;

public final class StatisticsDataQuality {

    public static final int MINIMUM_RECOMMENDED_DATA_POINTS = 7;

    private StatisticsDataQuality() {
    }

    public static StatisticsDataQualityModel fromDataPointCount(int dataPointCount) {
        return new StatisticsDataQualityModel(
                dataPointCount,
                MINIMUM_RECOMMENDED_DATA_POINTS,
                dataPointCount < MINIMUM_RECOMMENDED_DATA_POINTS);
    }

    public static StatisticsDataQualityModel fromEntries(List<?> entries) {
        return fromDataPointCount(entries == null ? 0 : entries.size());
    }
}
