package de.dermatrack.backend.statistics.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.statistics.service.impl.WeightedSymptomCalculator;

@DisplayName("WeightedSymptomCalculator Unit Tests")
class WeightedSymptomCalculatorTest {

    private final WeightedSymptomCalculator calculator = new WeightedSymptomCalculator();

    @Test
    @DisplayName("calculateSymptomWeight() should return 10 when all factors are at maximum")
    void calculateSymptomWeight_AllMaximum_ShouldReturnTen() {
        DiaryEntry entry = new DiaryEntry();
        entry.setSymptomItchiness(10);
        entry.setSymptomDryness(10);
        entry.setSymptomInflammation(10);
        entry.setSymptomScratch(true);
        entry.setSymptomWeepingSkin(true);
        entry.setSymptomSkinCracks(true);

        double result = calculator.calculateSymptomWeight(entry);

        assertThat(result).isEqualTo(10.0);
    }

    @Test
    @DisplayName("calculateSymptomWeight() should calculate weighted score from mixed values")
    void calculateSymptomWeight_MixedValues_ShouldReturnExpectedValue() {
        DiaryEntry entry = new DiaryEntry();
        entry.setSymptomItchiness(8);
        entry.setSymptomDryness(4);
        entry.setSymptomInflammation(6);
        entry.setSymptomScratch(true);
        entry.setSymptomWeepingSkin(false);
        entry.setSymptomSkinCracks(true);

        double result = calculator.calculateSymptomWeight(entry);

        // 8*0.2 + 4*0.1 + 6*0.3 + 10*0.1 + 0*0.15 + 10*0.15 = 6.3
        assertThat(result).isEqualTo(6.3);
    }

    @Test
    @DisplayName("calculateSymptomWeight() should return 0 for null entry")
    void calculateSymptomWeight_NullEntry_ShouldReturnZero() {
        double result = calculator.calculateSymptomWeight(null);

        assertThat(result).isEqualTo(0.0);
    }
}
