package de.dermatrack.backend.statistics.service;

import java.util.List;

public interface ICorrelationCalculator {

    Double calculatePearsonCorrelation(List<Double> firstSeries, List<Double> secondSeries);
}
