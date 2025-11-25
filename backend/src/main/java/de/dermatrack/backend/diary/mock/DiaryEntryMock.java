package de.dermatrack.backend.diary.mock;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Component;

import de.dermatrack.backend.auth.api.model.AppUser;
import de.dermatrack.backend.diary.api.model.DiaryEntry;
import de.dermatrack.backend.diary.api.repository.IDiaryEntryRepository;
import lombok.RequiredArgsConstructor;
import net.datafaker.Faker;

@Component
@RequiredArgsConstructor
public class DiaryEntryMock {

    private final IDiaryEntryRepository diaryEntryRepository;
    private final Faker faker = new Faker();

    public void createEntriesForAllUsers(List<AppUser> users) {

        // Create 30 random entries per user
        for (AppUser user : users) {
            for (int i = 0; i < 30; i++) {
                createRandomEntry(user, i);
            }
        }

    }

    private void createRandomEntry(AppUser user, int daysAgo) {
        DiaryEntry entry = new DiaryEntry();
        entry.setUser(user);
        entry.setCreatedAt(OffsetDateTime.now().minusDays(daysAgo));
        entry.setAllergies(faker.number().numberBetween(0, 10));
        entry.setInfections(faker.number().numberBetween(0, 10));
        entry.setStressLevel(faker.number().numberBetween(0, 10));
        entry.setSleep(faker.number().numberBetween(0, 10));
        entry.setNutrition(faker.number().numberBetween(0, 10));
        entry.setSymptoms(faker.number().numberBetween(0, 10));
        entry.setMiscellaneous(faker.lorem().sentence());

        diaryEntryRepository.save(entry);
    }
}
