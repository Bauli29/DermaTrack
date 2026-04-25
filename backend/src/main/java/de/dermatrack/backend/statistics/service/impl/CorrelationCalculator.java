package de.dermatrack.backend.statistics.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.math3.stat.correlation.PearsonsCorrelation;
import org.springframework.stereotype.Component;

import de.dermatrack.backend.statistics.service.ICorrelationCalculator;

@Component
public class CorrelationCalculator implements ICorrelationCalculator {

    @Override
    public Double calculatePearsonCorrelation(List<Double> firstSeries, List<Double> secondSeries) {
        if (firstSeries == null || secondSeries == null || firstSeries.size() != secondSeries.size()
                || firstSeries.size() < 2) {
            return null;
        }

        List<Double> filteredFirst = new ArrayList<>();
        List<Double> filteredSecond = new ArrayList<>();

        for (int i = 0; i < firstSeries.size(); i++) {
            Double first = firstSeries.get(i);
            Double second = secondSeries.get(i);
            if (first != null && second != null) {
                filteredFirst.add(first);
                filteredSecond.add(second);
            }
        }

        if (filteredFirst.size() < 2) {
            return null;
        }

        double[] firstArray = filteredFirst.stream().mapToDouble(Double::doubleValue).toArray();
        double[] secondArray = filteredSecond.stream().mapToDouble(Double::doubleValue).toArray();

        double correlation = new PearsonsCorrelation().correlation(firstArray, secondArray);
        if (Double.isNaN(correlation) || Double.isInfinite(correlation)) {
            return null;
        }

        return correlation;
    }
}
