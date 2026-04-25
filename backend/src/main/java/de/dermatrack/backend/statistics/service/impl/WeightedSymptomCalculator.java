package de.dermatrack.backend.statistics.service.impl;

import org.springframework.stereotype.Component;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.statistics.service.IWeightedSymptomCalculator;

@Component
public class WeightedSymptomCalculator implements IWeightedSymptomCalculator {

    private static final double ITCHINESS_WEIGHT = 0.2;
    private static final double DRYNESS_WEIGHT = 0.1;
    private static final double INFLAMMATION_WEIGHT = 0.3;
    private static final double SCRATCH_WEIGHT = 0.1;
    private static final double WEEPING_SKIN_WEIGHT = 0.15;
    private static final double SKIN_CRACKS_WEIGHT = 0.15;

    @Override
    public double calculateSymptomWeight(DiaryEntry entry) {
        if (entry == null) {
            return 0.0;
        }

        double weightedScore = safeRating(entry.getSymptomItchiness()) * ITCHINESS_WEIGHT +
                safeRating(entry.getSymptomDryness()) * DRYNESS_WEIGHT +
                safeRating(entry.getSymptomInflammation()) * INFLAMMATION_WEIGHT +
                booleanToRating(entry.getSymptomScratch()) * SCRATCH_WEIGHT +
                booleanToRating(entry.getSymptomWeepingSkin()) * WEEPING_SKIN_WEIGHT +
                booleanToRating(entry.getSymptomSkinCracks()) * SKIN_CRACKS_WEIGHT;

        return Math.max(0.0, Math.min(10.0, weightedScore));
    }

    private double safeRating(Integer value) {
        if (value == null) {
            return 0.0;
        }
        return Math.max(0, Math.min(10, value));
    }

    private double booleanToRating(Boolean value) {
        return Boolean.TRUE.equals(value) ? 10.0 : 0.0;
    }
}
