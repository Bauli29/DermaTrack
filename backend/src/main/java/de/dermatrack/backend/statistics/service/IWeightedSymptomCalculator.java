package de.dermatrack.backend.statistics.service;

import de.dermatrack.backend.diary.model.DiaryEntry;

public interface IWeightedSymptomCalculator {

    double calculateSymptomWeight(DiaryEntry entry);
}
