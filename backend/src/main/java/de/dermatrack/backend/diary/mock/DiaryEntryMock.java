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

        // Create 100 random entries per user (enough data for 90+ day correlations)
        for (AppUser user : users) {
            for (int i = 0; i < 100; i++) {
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

        // Create correlated data: contact factors influence symptoms
        boolean hasContactIssue = faker.number().numberBetween(0, 100) < 50; // 50% chance - strong correlation
        entry.setContactShower(hasContactIssue);
        entry.setContactShowerNotes(hasContactIssue ? faker.options().option("hot", "warm") : "cold");
        entry.setContactClothing(hasContactIssue);
        entry.setContactClothingNotes(hasContactIssue ? faker.options().option("wool", "tight", "synthetic") : "none");
        entry.setContactAnimal(hasContactIssue && faker.bool().bool());
        entry.setContactAnimalNotes(hasContactIssue ? faker.options().option("cat", "dog") : "none");
        entry.setCustomContactFactors(Arrays.asList("dust", "cleaning-agent"));

        // Create correlated data: nutrition factors influence symptoms
        boolean hasNutritionIssue = faker.number().numberBetween(0, 100) < 45; // 45% chance - strong correlation
        entry.setNutritionNuts(hasNutritionIssue);
        entry.setNutritionNutsNotes(hasNutritionIssue ? faker.options().option("low", "medium", "high") : "none");
        entry.setNutritionFruits(hasNutritionIssue && faker.bool().bool());
        entry.setNutritionFruitsNotes(hasNutritionIssue ? faker.options().option("low", "medium") : "none");
        entry.setNutritionShellfish(hasNutritionIssue && faker.bool().bool());
        entry.setNutritionShellfishNotes(hasNutritionIssue ? faker.options().option("medium", "high") : "none");
        entry.setNutritionDairy(hasNutritionIssue && faker.bool().bool());
        entry.setNutritionDairyNotes(hasNutritionIssue ? faker.options().option("low", "medium") : "none");
        entry.setNutritionGluten(hasNutritionIssue && faker.bool().bool());
        entry.setNutritionGlutenNotes(hasNutritionIssue ? faker.options().option("medium", "high") : "none");
        entry.setCustomNutritionFactors(Arrays.asList("chocolate", "spicy-food"));

        // Create correlated data: care products influence symptoms
        boolean hasCareProductIssue = faker.number().numberBetween(0, 100) < 50; // 50% chance - strong correlation
        entry.setCareSkinCare(hasCareProductIssue);
        entry.setCareSkinCareNotes(hasCareProductIssue ? faker.options().option("mild", "intense") : "none");
        entry.setCareHairProducts(hasCareProductIssue);
        entry.setCareHairProductsNotes(hasCareProductIssue ? faker.options().option("mild", "intense") : "none");
        entry.setCareSoapShampoo(hasCareProductIssue && faker.bool().bool());
        entry.setCareSoapShampooNotes(hasCareProductIssue ? faker.options().option("mild", "intense") : "none");
        entry.setCareCosmetics(hasCareProductIssue && faker.bool().bool());
        entry.setCareCosmeticsNotes(hasCareProductIssue ? faker.options().option("mild", "intense") : "none");
        entry.setCustomCareProducts(Arrays.asList("Balea Med Shampoo", "Eucerin Lotion"));

        // Create correlated data: health factors influence symptoms
        boolean hasHealthIssue = faker.number().numberBetween(0, 100) < 40; // 40% chance - strong correlation
        entry.setHealthOtherAllergies(hasHealthIssue);
        entry.setHealthOtherAllergiesNotes(hasHealthIssue ? faker.options().option("pollen", "dust mites") : "none");
        entry.setHealthInfections(hasHealthIssue && faker.bool().bool());
        entry.setHealthInfectionsNotes(hasHealthIssue ? faker.options().option("cold", "flu") : "none");

        // Symptoms strongly correlate with factor presence: high symptoms when factors
        // present, low otherwise
        int activeFactors = (hasContactIssue ? 1 : 0) +
                (hasNutritionIssue ? 1 : 0) +
                (hasCareProductIssue ? 1 : 0) +
                (hasHealthIssue ? 1 : 0);

        // No factors: symptoms 0-2; 1-2 factors: 4-6; 3-4 factors: 7-10
        int baseSymptom = activeFactors == 0 ? faker.number().numberBetween(0, 2)
                : activeFactors <= 2 ? faker.number().numberBetween(4, 6) : faker.number().numberBetween(7, 10);

        entry.setSymptomItchiness(baseSymptom);
        entry.setSymptomScratch(activeFactors > 0);
        entry.setSymptomInflammation(baseSymptom);
        entry.setSymptomDryness(baseSymptom);
        entry.setSymptomWeepingSkin(activeFactors > 2);
        entry.setSymptomSkinCracks(activeFactors > 1);
        entry.setSymptomSpreadPhotoUrls(Arrays.asList(
                "https://example.org/photo/area-1.jpg",
                "https://example.org/photo/area-2.jpg"));

        entry.setNotes(faker.lorem().sentence());

        diaryEntryRepository.save(entry);
    }
}
