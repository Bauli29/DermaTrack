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
    void getPsycheAndSymptomsLast7Days_ShouldReturnLineChart() throws Exception {
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
                .andExpect(jsonPath("$.categories.length()").value(7))
                .andExpect(jsonPath("$.categories[0]").value("2026-04-20"))
                .andExpect(jsonPath("$.categories[6]").value("2026-04-26"))
                .andExpect(jsonPath("$.dateRange.from").value("2026-04-20"))
                .andExpect(jsonPath("$.dateRange.to").value("2026-04-26"))
                .andExpect(jsonPath("$.series.length()").value(4))
                .andExpect(jsonPath("$.series[0].name").value("Mental Strain"))
                .andExpect(jsonPath("$.series[0].data[0]").value(8.0))
                .andExpect(jsonPath("$.series[1].name").value("Stress Level"))
                .andExpect(jsonPath("$.series[2].name").value("Sleep"))
                .andExpect(jsonPath("$.series[3].name").value("Weighted Symptoms"))
                .andExpect(jsonPath("$.series[3].data[0]").value(10.0))
                .andExpect(jsonPath("$.series[3].data[6]").value(2.9));
    }

    @Test
    @DisplayName("GET /api/statistics/symptoms should return a column chart and ignore entries of other users")
    void getSymptomsLast7Days_ShouldReturnColumnChartForAuthenticatedUserOnly() throws Exception {
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
                .andExpect(jsonPath("$.categories.length()").value(7))
                .andExpect(jsonPath("$.series.length()").value(3))
                .andExpect(jsonPath("$.series[0].name").value("Itchiness"))
                .andExpect(jsonPath("$.series[0].data[6]").value(4.0))
                .andExpect(jsonPath("$.series[1].name").value("Dryness"))
                .andExpect(jsonPath("$.series[1].data[6]").value(2.0))
                .andExpect(jsonPath("$.series[2].name").value("Inflammation"))
                .andExpect(jsonPath("$.series[2].data[6]").value(3.0));
    }

    @Test
    @DisplayName("GET /api/statistics endpoints without authentication should return 401")
    void getStatisticsWithoutAuthentication_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/statistics/psyche-symptoms"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/statistics/psyche-symptoms with invalid endDate should return 400")
    void getPsycheAndSymptomsLast7Days_WithInvalidEndDate_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/statistics/psyche-symptoms")
                        .with(user("statsuser"))
                        .queryParam("endDate", "not-a-date"))
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
