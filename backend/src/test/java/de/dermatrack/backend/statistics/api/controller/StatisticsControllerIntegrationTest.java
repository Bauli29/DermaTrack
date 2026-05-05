package de.dermatrack.backend.statistics.api.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("StatisticsController Integration Tests")
class StatisticsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IDiaryEntryRepository diaryEntryRepository;

    @Autowired
    private IAppUserRepository appUserRepository;

    private AppUser testUser;

    @BeforeEach
    void setUp() {
        testUser = new AppUser();
        testUser.setUsername("statsuser");
        testUser.setPassword("password123");
        testUser.setEmail("stats@example.com");
        testUser = appUserRepository.save(testUser);
    }

    @Test
    @DisplayName("GET /api/statistics/psyche-symptoms should return a line chart in highcharts shape")
    void getPsycheAndSymptoms_ShouldReturnLineChart() throws Exception {
        diaryEntryRepository.save(buildEntry(
                testUser,
                LocalDate.of(2026, 4, 20),
                8, 4, 6,
                10, 10, 10,
                true, true, true));
        diaryEntryRepository.save(buildEntry(
                testUser,
                LocalDate.of(2026, 4, 26),
                5, 3, 7,
                4, 2, 3,
                true, false, false));

        mockMvc.perform(get("/api/statistics/psyche-symptoms")
                        .with(user("statsuser"))
                        .queryParam("endDate", "2026-04-26"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chartType").value("line"))
                .andExpect(jsonPath("$.categories.length()").value(30))
                .andExpect(jsonPath("$.categories[0]").value("2026-03-28"))
                .andExpect(jsonPath("$.categories[29]").value("2026-04-26"))
                .andExpect(jsonPath("$.dateRange.from").value("2026-03-28"))
                .andExpect(jsonPath("$.dateRange.to").value("2026-04-26"))
                .andExpect(jsonPath("$.dataQuality.dataPointCount").value(2))
                .andExpect(jsonPath("$.dataQuality.minimumRecommendedDataPoints").value(7))
                .andExpect(jsonPath("$.dataQuality.insufficientData").value(true))
                .andExpect(jsonPath("$.series.length()").value(4))
                .andExpect(jsonPath("$.series[0].name").value("Mental Strain"))
                .andExpect(jsonPath("$.series[0].data[23]").value(8.0))
                .andExpect(jsonPath("$.series[1].name").value("Stress Level"))
                .andExpect(jsonPath("$.series[2].name").value("Sleep"))
                .andExpect(jsonPath("$.series[3].name").value("Weighted Symptoms"))
                .andExpect(jsonPath("$.series[3].data[23]").value(10.0))
                .andExpect(jsonPath("$.series[3].data[29]").value(2.9));
    }

    @Test
    @DisplayName("GET /api/statistics/symptoms should return a column chart and ignore entries of other users")
    void getSymptoms_ShouldReturnColumnChartForAuthenticatedUserOnly() throws Exception {
        AppUser otherUser = new AppUser();
        otherUser.setUsername("otherstatsuser");
        otherUser.setPassword("password123");
        otherUser.setEmail("otherstats@example.com");
        otherUser = appUserRepository.save(otherUser);

        diaryEntryRepository.save(buildEntry(
                testUser,
                LocalDate.of(2026, 4, 26),
                1, 2, 3,
                4, 2, 3,
                false, false, false));
        diaryEntryRepository.save(buildEntry(
                otherUser,
                LocalDate.of(2026, 4, 26),
                9, 9, 9,
                9, 9, 9,
                true, true, true));

        mockMvc.perform(get("/api/statistics/symptoms")
                        .with(user("statsuser"))
                        .queryParam("endDate", "2026-04-26"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chartType").value("column"))
                .andExpect(jsonPath("$.categories.length()").value(30))
                .andExpect(jsonPath("$.series.length()").value(3))
                .andExpect(jsonPath("$.series[0].name").value("Itchiness"))
                .andExpect(jsonPath("$.series[0].data[29]").value(4.0))
                .andExpect(jsonPath("$.series[1].name").value("Dryness"))
                .andExpect(jsonPath("$.series[1].data[29]").value(2.0))
                .andExpect(jsonPath("$.series[2].name").value("Inflammation"))
                .andExpect(jsonPath("$.series[2].data[29]").value(3.0));
    }

    @Test
    @DisplayName("GET /api/statistics endpoints without authentication should return 401")
    void getStatisticsWithoutAuthentication_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/statistics/psyche-symptoms"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/statistics/symptoms should support a broader selected period")
    void getSymptoms_WithThirtyDayPeriod_ShouldReturnThirtyDayWindow() throws Exception {
        diaryEntryRepository.save(buildEntry(
                testUser,
                LocalDate.of(2026, 3, 28),
                1, 2, 3,
                4, 2, 3,
                false, false, false));

        mockMvc.perform(get("/api/statistics/symptoms")
                        .with(user("statsuser"))
                        .queryParam("endDate", "2026-04-26")
                        .queryParam("period", "30d"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chartType").value("column"))
                .andExpect(jsonPath("$.categories.length()").value(30))
                .andExpect(jsonPath("$.categories[0]").value("2026-03-28"))
                .andExpect(jsonPath("$.categories[29]").value("2026-04-26"))
                .andExpect(jsonPath("$.dateRange.from").value("2026-03-28"))
                .andExpect(jsonPath("$.dateRange.to").value("2026-04-26"))
                .andExpect(jsonPath("$.series[0].data[0]").value(4.0));
    }

    @Test
    @DisplayName("GET /api/statistics/symptoms should support the one-year period")
    void getSymptoms_WithOneYearPeriod_ShouldReturnOneYearWindow() throws Exception {
        diaryEntryRepository.save(buildEntry(
                testUser,
                LocalDate.of(2025, 4, 27),
                1, 2, 3,
                4, 2, 3,
                false, false, false));

        mockMvc.perform(get("/api/statistics/symptoms")
                        .with(user("statsuser"))
                        .queryParam("endDate", "2026-04-26")
                        .queryParam("period", "1y"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chartType").value("column"))
                .andExpect(jsonPath("$.categories.length()").value(365))
                .andExpect(jsonPath("$.categories[0]").value("2025-04-27"))
                .andExpect(jsonPath("$.categories[364]").value("2026-04-26"))
                .andExpect(jsonPath("$.dateRange.from").value("2025-04-27"))
                .andExpect(jsonPath("$.dateRange.to").value("2026-04-26"))
                .andExpect(jsonPath("$.series[0].data[0]").value(4.0));
    }

    @Test
    @DisplayName("GET /api/statistics/symptoms should support a custom date range")
    void getSymptoms_WithCustomDateRange_ShouldReturnCustomWindow() throws Exception {
        diaryEntryRepository.save(buildEntry(
                testUser,
                LocalDate.of(2026, 4, 10),
                1, 2, 3,
                4, 2, 3,
                false, false, false));

        mockMvc.perform(get("/api/statistics/symptoms")
                        .with(user("statsuser"))
                        .queryParam("fromDate", "2026-04-10")
                        .queryParam("endDate", "2026-04-20")
                        .queryParam("period", "1y"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chartType").value("column"))
                .andExpect(jsonPath("$.categories.length()").value(11))
                .andExpect(jsonPath("$.categories[0]").value("2026-04-10"))
                .andExpect(jsonPath("$.categories[10]").value("2026-04-20"))
                .andExpect(jsonPath("$.dateRange.from").value("2026-04-10"))
                .andExpect(jsonPath("$.dateRange.to").value("2026-04-20"))
                .andExpect(jsonPath("$.series[0].data[0]").value(4.0));
    }

    @Test
    @DisplayName("GET /api/statistics/factor-impacts should return factor impact statistics")
    void getFactorImpacts_ShouldReturnFactorImpactStatistics() throws Exception {
        DiaryEntry highNutsEntry = buildEntry(
                testUser,
                LocalDate.of(2026, 4, 25),
                1, 2, 3,
                8, 7, 6,
                true, false, false);
        highNutsEntry.setNutritionNuts("high");
        diaryEntryRepository.save(highNutsEntry);

        DiaryEntry noNutsEntry = buildEntry(
                testUser,
                LocalDate.of(2026, 4, 26),
                1, 2, 3,
                2, 1, 1,
                false, false, false);
        noNutsEntry.setNutritionNuts("none");
        diaryEntryRepository.save(noNutsEntry);

        mockMvc.perform(get("/api/statistics/factor-impacts")
                        .with(user("statsuser"))
                        .queryParam("endDate", "2026-04-26")
                        .queryParam("period", "30d"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dateRange.from").value("2026-03-28"))
                .andExpect(jsonPath("$.dateRange.to").value("2026-04-26"))
                .andExpect(jsonPath("$.totalEntries").value(2))
                .andExpect(jsonPath("$.averageWeightedSymptomScore").value(2.95))
                .andExpect(jsonPath("$.dataQuality.dataPointCount").value(2))
                .andExpect(jsonPath("$.dataQuality.minimumRecommendedDataPoints").value(7))
                .andExpect(jsonPath("$.dataQuality.insufficientData").value(true))
                .andExpect(jsonPath("$.factors[0].key").value("nutrition.nuts"))
                .andExpect(jsonPath("$.factors[0].label").value("Nuts"))
                .andExpect(jsonPath("$.factors[0].occurrenceCount").value(1))
                .andExpect(jsonPath("$.factors[0].averageWeightedSymptomScore").value(5.1));
    }

    @Test
    @DisplayName("GET /api/statistics/psyche-symptoms with invalid endDate should return 400")
    void getPsycheAndSymptoms_WithInvalidEndDate_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/statistics/psyche-symptoms")
                        .with(user("statsuser"))
                        .queryParam("endDate", "not-a-date"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/statistics/psyche-symptoms with fromDate after endDate should return 400")
    void getPsycheAndSymptoms_WithFromDateAfterEndDate_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/statistics/psyche-symptoms")
                        .with(user("statsuser"))
                        .queryParam("fromDate", "2026-04-27")
                        .queryParam("endDate", "2026-04-26"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/statistics/psyche-symptoms with invalid period should return 400")
    void getPsycheAndSymptoms_WithInvalidPeriod_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/statistics/psyche-symptoms")
                        .with(user("statsuser"))
                        .queryParam("period", "14d"))
                .andExpect(status().isBadRequest());
    }

    private DiaryEntry buildEntry(
            AppUser user,
            LocalDate entryDate,
            Integer mentalStrain,
            Integer stressLevel,
            Integer sleep,
            Integer itchiness,
            Integer dryness,
            Integer inflammation,
            Boolean scratch,
            Boolean weepingSkin,
            Boolean skinCracks) {
        DiaryEntry entry = new DiaryEntry();
        entry.setUser(user);
        entry.setEntryDate(entryDate);
        entry.setMentalStrain(mentalStrain);
        entry.setStressLevel(stressLevel);
        entry.setSleep(sleep);
        entry.setSymptomItchiness(itchiness);
        entry.setSymptomDryness(dryness);
        entry.setSymptomInflammation(inflammation);
        entry.setSymptomScratch(scratch);
        entry.setSymptomWeepingSkin(weepingSkin);
        entry.setSymptomSkinCracks(skinCracks);
        return entry;
    }
}
