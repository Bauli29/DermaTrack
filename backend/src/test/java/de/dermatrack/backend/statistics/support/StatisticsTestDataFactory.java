package de.dermatrack.backend.statistics.support;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import de.dermatrack.backend.diary.model.DiaryEntry;

public final class StatisticsTestDataFactory {

    private StatisticsTestDataFactory() {
    }

    public static DiaryEntry buildEntryForBarChart(LocalDate date, Integer itchiness, Integer dryness, Integer inflammation,
            Boolean scratch, Boolean weepingSkin, Boolean skinCracks) {
        DiaryEntry entry = new DiaryEntry();
        entry.setEntryDate(date);
        entry.setSymptomItchiness(itchiness);
        entry.setSymptomDryness(dryness);
        entry.setSymptomInflammation(inflammation);
        entry.setSymptomScratch(scratch);
        entry.setSymptomWeepingSkin(weepingSkin);
        entry.setSymptomSkinCracks(skinCracks);
        return entry;
    }

    public static DiaryEntry buildEntryForLineChart(LocalDate date, Integer mentalstrain, Integer stress, Integer sleep) {
        DiaryEntry entry = new DiaryEntry();
        entry.setEntryDate(date);
        entry.setMentalStrain(mentalstrain);
        entry.setStressLevel(stress);
        entry.setSleep(sleep);
        return entry;
    }
    public static List<LocalDate> lastSevenDaysEndingAt(LocalDate endDate) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate current = endDate.minusDays(6);
        while (!current.isAfter(endDate)) {
            dates.add(current);
            current = current.plusDays(1);
        }
        return dates;
    }
}
