package de.dermatrack.backend.statistics.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import de.dermatrack.backend.statistics.service.impl.CorrelationCalculator;

@DisplayName("CorrelationCalculator Unit Tests")
class CorrelationCalculatorTest {

    private final CorrelationCalculator correlationCalculator = new CorrelationCalculator();

    @Test
    @DisplayName("calculatePearsonCorrelation() should return positive correlation for matching trends")
    void calculatePearsonCorrelation_WithMatchingTrends_ShouldReturnPositiveValue() {
        Double correlation = correlationCalculator.calculatePearsonCorrelation(
                List.of(1.0, 2.0, 3.0, 4.0),
                List.of(2.0, 4.0, 6.0, 8.0));

        assertThat(correlation).isEqualTo(1.0);
    }

    @Test
    @DisplayName("calculatePearsonCorrelation() should ignore null pairs")
    void calculatePearsonCorrelation_WithNullPairs_ShouldFilterAndCalculate() {
        Double correlation = correlationCalculator.calculatePearsonCorrelation(
                Arrays.asList(1.0, null, 3.0, 4.0),
                List.of(2.0, 5.0, 6.0, 8.0));

        assertThat(correlation).isEqualTo(1.0);
    }

    @Test
    @DisplayName("calculatePearsonCorrelation() should return null for invalid input")
    void calculatePearsonCorrelation_InvalidInput_ShouldReturnNull() {
        Double correlation = correlationCalculator.calculatePearsonCorrelation(
                List.of(1.0),
                List.of(2.0));

        assertThat(correlation).isNull();
    }
}
