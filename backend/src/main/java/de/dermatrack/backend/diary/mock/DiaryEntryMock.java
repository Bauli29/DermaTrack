package de.dermatrack.backend.diary.mock;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Component;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;
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
        entry.setEntryDate(OffsetDateTime.now().minusDays(daysAgo).toLocalDate());

        entry.setStressLevel(faker.number().numberBetween(0, 10));
        entry.setSleep(faker.number().numberBetween(0, 10));
        entry.setMentalStrain(faker.number().numberBetween(0, 10));

        entry.setContactShower(faker.bool().bool());
        entry.setContactShowerNotes(faker.options().option("hot", "warm", "cold"));
        entry.setContactClothing(faker.bool().bool());
        entry.setContactClothingNotes(faker.options().option("wool", "tight", "synthetic", "none"));
        entry.setContactAnimal(faker.bool().bool());
        entry.setContactAnimalNotes(faker.options().option("none", "cat", "dog", "bird"));
        entry.setCustomContactFactors(Arrays.asList("dust", "cleaning-agent"));

        entry.setNutritionNuts(faker.bool().bool());
        entry.setNutritionNutsNotes(faker.options().option("none", "low", "medium", "high"));
        entry.setNutritionFruits(faker.bool().bool());
        entry.setNutritionFruitsNotes(faker.options().option("none", "low", "medium", "high"));
        entry.setNutritionShellfish(faker.bool().bool());
        entry.setNutritionShellfishNotes(faker.options().option("none", "low", "medium", "high"));
        entry.setNutritionDairy(faker.bool().bool());
        entry.setNutritionDairyNotes(faker.options().option("none", "low", "medium", "high"));
        entry.setNutritionGluten(faker.bool().bool());
        entry.setNutritionGlutenNotes(faker.options().option("none", "low", "medium", "high"));
        entry.setCustomNutritionFactors(Arrays.asList("chocolate", "spicy-food"));

        entry.setCareSkinCare(faker.bool().bool());
        entry.setCareSkinCareNotes(faker.options().option("none", "mild", "intense"));
        entry.setCareHairProducts(faker.bool().bool());
        entry.setCareHairProductsNotes(faker.options().option("none", "mild", "intense"));
        entry.setCareSoapShampoo(faker.bool().bool());
        entry.setCareSoapShampooNotes(faker.options().option("none", "mild", "intense"));
        entry.setCareCosmetics(faker.bool().bool());
        entry.setCareCosmeticsNotes(faker.options().option("none", "mild", "intense"));
        entry.setCustomCareProducts(Arrays.asList("Balea Med Shampoo", "Eucerin Lotion"));

        entry.setHealthOtherAllergies(faker.bool().bool());
        entry.setHealthOtherAllergiesNotes(faker.options().option("none", "pollen", "dust mites"));
        entry.setHealthInfections(faker.bool().bool());
        entry.setHealthInfectionsNotes(faker.options().option("none", "cold", "flu"));

        entry.setSymptomItchiness(faker.number().numberBetween(0, 10));
        entry.setSymptomScratch(faker.bool().bool());
        entry.setSymptomInflammation(faker.number().numberBetween(0, 10));
        entry.setSymptomDryness(faker.number().numberBetween(0, 10));
        entry.setSymptomWeepingSkin(faker.bool().bool());
        entry.setSymptomSkinCracks(faker.bool().bool());
        entry.setSymptomSpreadPhotoUrls(Arrays.asList(
                "https://example.org/photo/area-1.jpg",
                "https://example.org/photo/area-2.jpg"));

        entry.setNotes(faker.lorem().sentence());

        diaryEntryRepository.save(entry);
    }
}
