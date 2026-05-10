package de.dermatrack.backend.statistics.model.correlation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("StatisticsMainCategory Unit Tests")
class StatisticsMainCategoryTest {

    @Test
    @DisplayName("fromQueryValue() should accept 'care-products' exact value")
    void fromQueryValue_WithCareProducts_ShouldReturnCareProductsCategory() {
        StatisticsMainCategory category = StatisticsMainCategory.fromQueryValue("care-products");

        assertThat(category).isEqualTo(StatisticsMainCategory.CARE_PRODUCTS);
        assertThat(category.getQueryValue()).isEqualTo("care-products");
        assertThat(category.getDisplayName()).isEqualTo("Care Products");
    }

    @Test
    @DisplayName("fromQueryValue() should accept 'nutrition' exact value")
    void fromQueryValue_WithNutrition_ShouldReturnNutritionCategory() {
        StatisticsMainCategory category = StatisticsMainCategory.fromQueryValue("nutrition");

        assertThat(category).isEqualTo(StatisticsMainCategory.NUTRITION);
        assertThat(category.getQueryValue()).isEqualTo("nutrition");
        assertThat(category.getDisplayName()).isEqualTo("Nutrition");
    }

    @Test
    @DisplayName("fromQueryValue() should accept 'contact-factors' exact value")
    void fromQueryValue_WithContactFactors_ShouldReturnContactFactorsCategory() {
        StatisticsMainCategory category = StatisticsMainCategory.fromQueryValue("contact-factors");

        assertThat(category).isEqualTo(StatisticsMainCategory.CONTACT_FACTORS);
        assertThat(category.getQueryValue()).isEqualTo("contact-factors");
        assertThat(category.getDisplayName()).isEqualTo("Contact Factors");
    }

    @Test
    @DisplayName("fromQueryValue() should accept 'health-factors' exact value")
    void fromQueryValue_WithHealthFactors_ShouldReturnHealthFactorsCategory() {
        StatisticsMainCategory category = StatisticsMainCategory.fromQueryValue("health-factors");

        assertThat(category).isEqualTo(StatisticsMainCategory.HEALTH_FACTORS);
        assertThat(category.getQueryValue()).isEqualTo("health-factors");
        assertThat(category.getDisplayName()).isEqualTo("Health Factors");
    }

    @Test
    @DisplayName("fromQueryValue() should be case-insensitive")
    void fromQueryValue_WithUppercaseValue_ShouldResolveCaseInsensitively() {
        StatisticsMainCategory category = StatisticsMainCategory.fromQueryValue("CARE-PRODUCTS");

        assertThat(category).isEqualTo(StatisticsMainCategory.CARE_PRODUCTS);
    }

    @Test
    @DisplayName("fromQueryValue() should handle mixed case")
    void fromQueryValue_WithMixedCase_ShouldResolveCaseInsensitively() {
        StatisticsMainCategory category = StatisticsMainCategory.fromQueryValue("Nutrition");

        assertThat(category).isEqualTo(StatisticsMainCategory.NUTRITION);
    }

    @Test
    @DisplayName("fromQueryValue() should trim whitespace")
    void fromQueryValue_WithWhitespace_ShouldTrimAndResolve() {
        StatisticsMainCategory category = StatisticsMainCategory.fromQueryValue("  contact-factors  ");

        assertThat(category).isEqualTo(StatisticsMainCategory.CONTACT_FACTORS);
    }

    @ParameterizedTest
    @DisplayName("fromQueryValue() should reject invalid values")
    @ValueSource(strings = {
            "invalid",
            "Care Products",
            "CARE_PRODUCTS",
            "careproducts",
            "care products",
            "skin-care",
            "nuts",
            "shower",
            "custom-factors"
    })
    void fromQueryValue_WithInvalidValues_ShouldThrowIllegalArgumentException(String invalidValue) {
        assertThatThrownBy(() -> StatisticsMainCategory.fromQueryValue(invalidValue))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported main category")
                .hasMessageContaining("care-products")
                .hasMessageContaining("nutrition")
                .hasMessageContaining("contact-factors")
                .hasMessageContaining("health-factors");
    }

    @Test
    @DisplayName("fromQueryValue() should reject null value")
    void fromQueryValue_WithNull_ShouldThrowIllegalArgumentException() {
        assertThatThrownBy(() -> StatisticsMainCategory.fromQueryValue(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Main category is required");
    }

    @Test
    @DisplayName("fromQueryValue() should reject blank value")
    void fromQueryValue_WithBlank_ShouldThrowIllegalArgumentException() {
        assertThatThrownBy(() -> StatisticsMainCategory.fromQueryValue("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Main category is required");
    }

    @Test
    @DisplayName("getFixedSubcategories() for CARE_PRODUCTS should return 4 subcategories")
    void getFixedSubcategories_ForCareProducts_ShouldReturn4Items() {
        StatisticsMainCategory category = StatisticsMainCategory.CARE_PRODUCTS;

        assertThat(category.getFixedSubcategories())
                .hasSize(4)
                .extracting(StatisticsMainCategory.CorrelationSubcategory::name)
                .containsExactly("Skin Care", "Hair Products", "Soap Shampoo", "Cosmetics");
    }

    @Test
    @DisplayName("getFixedSubcategories() for NUTRITION should return 5 subcategories")
    void getFixedSubcategories_ForNutrition_ShouldReturn5Items() {
        StatisticsMainCategory category = StatisticsMainCategory.NUTRITION;

        assertThat(category.getFixedSubcategories())
                .hasSize(5)
                .extracting(StatisticsMainCategory.CorrelationSubcategory::name)
                .containsExactly("Nuts", "Fruits", "Shellfish", "Dairy", "Gluten");
    }

    @Test
    @DisplayName("getFixedSubcategories() for CONTACT_FACTORS should return 3 subcategories")
    void getFixedSubcategories_ForContactFactors_ShouldReturn3Items() {
        StatisticsMainCategory category = StatisticsMainCategory.CONTACT_FACTORS;

        assertThat(category.getFixedSubcategories())
                .hasSize(3)
                .extracting(StatisticsMainCategory.CorrelationSubcategory::name)
                .containsExactly("Shower", "Clothing", "Animal Contact");
    }

    @Test
    @DisplayName("getFixedSubcategories() for HEALTH_FACTORS should return 2 subcategories")
    void getFixedSubcategories_ForHealthFactors_ShouldReturn2Items() {
        StatisticsMainCategory category = StatisticsMainCategory.HEALTH_FACTORS;

        assertThat(category.getFixedSubcategories())
                .hasSize(2)
                .extracting(StatisticsMainCategory.CorrelationSubcategory::name)
                .containsExactly("Other Allergies", "Infections");
    }
}
