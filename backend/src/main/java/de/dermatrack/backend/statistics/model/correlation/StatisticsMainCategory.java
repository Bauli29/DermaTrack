package de.dermatrack.backend.statistics.model.correlation;

import java.util.List;
import java.util.Locale;
import java.util.function.Function;

import de.dermatrack.backend.diary.model.DiaryEntry;
import lombok.Getter;

@Getter
public enum StatisticsMainCategory {
    CARE_PRODUCTS("care-products", "Care Products", List.of(
            subcategory("Skin Care", entry -> booleanToDouble(entry.getCareSkinCare())),
            subcategory("Hair Products", entry -> booleanToDouble(entry.getCareHairProducts())),
            subcategory("Soap Shampoo", entry -> booleanToDouble(entry.getCareSoapShampoo())),
            subcategory("Cosmetics", entry -> booleanToDouble(entry.getCareCosmetics())))),

    NUTRITION("nutrition", "Nutrition", List.of(
            subcategory("Nuts", entry -> booleanToDouble(entry.getNutritionNuts())),
            subcategory("Fruits", entry -> booleanToDouble(entry.getNutritionFruits())),
            subcategory("Shellfish", entry -> booleanToDouble(entry.getNutritionShellfish())),
            subcategory("Dairy", entry -> booleanToDouble(entry.getNutritionDairy())),
            subcategory("Gluten", entry -> booleanToDouble(entry.getNutritionGluten())))),

    CONTACT_FACTORS("contact-factors", "Contact Factors", List.of(
            subcategory("Shower", entry -> booleanToDouble(entry.getContactShower())),
            subcategory("Clothing", entry -> booleanToDouble(entry.getContactClothing())),
            subcategory("Animal Contact", entry -> booleanToDouble(entry.getContactAnimal())))),

    HEALTH_FACTORS("health-factors", "Health Factors", List.of(
            subcategory("Other Allergies", entry -> booleanToDouble(entry.getHealthOtherAllergies())),
            subcategory("Infections", entry -> booleanToDouble(entry.getHealthInfections()))));

    private final String queryValue;
    private final String displayName;
    private final List<CorrelationSubcategory> fixedSubcategories;

    StatisticsMainCategory(String queryValue,
            String displayName,
            List<CorrelationSubcategory> fixedSubcategories) {
        this.queryValue = queryValue;
        this.displayName = displayName;
        this.fixedSubcategories = fixedSubcategories;
    }

    public static StatisticsMainCategory fromQueryValue(String queryValue) {
        if (queryValue == null || queryValue.isBlank()) {
            throw new IllegalArgumentException(
                    "Main category is required. Supported values: care-products, nutrition, contact-factors, health-factors");
        }

        String normalizedQueryValue = normalize(queryValue);

        for (StatisticsMainCategory category : values()) {
            if (normalize(category.queryValue).equals(normalizedQueryValue)) {
                return category;
            }
        }

        throw new IllegalArgumentException(
                "Unsupported main category. Supported values: care-products, nutrition, contact-factors, health-factors");
    }

    private static CorrelationSubcategory subcategory(String name, Function<DiaryEntry, Double> valueExtractor) {
        return new CorrelationSubcategory(name, valueExtractor);
    }

    private static Double booleanToDouble(Boolean value) {
        if (value == null) {
            return null;
        }
        return Boolean.TRUE.equals(value) ? 1.0 : 0.0;
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }

        return value.trim().toLowerCase(Locale.ROOT);
    }

    public record CorrelationSubcategory(String name, Function<DiaryEntry, Double> valueExtractor) {
    }
}