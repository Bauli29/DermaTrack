package de.dermatrack.backend.diary.api.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import de.dermatrack.backend.auth.model.AppUser;
import de.dermatrack.backend.auth.repository.IAppUserRepository;
import de.dermatrack.backend.diary.model.DiaryEntry;
import de.dermatrack.backend.diary.repository.IDiaryEntryRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("DiaryController Integration Tests")
class DiaryControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @Autowired
        private IDiaryEntryRepository diaryEntryRepository;

        @Autowired
        private IAppUserRepository appUserRepository;

        private AppUser testUser;
        private DiaryEntry testEntry;

        @BeforeEach
        void setUp() {
                testUser = new AppUser();
                testUser.setUsername("testuser");
                testUser.setPassword("password123");
                testUser.setEmail("test@example.com");
                testUser = appUserRepository.save(testUser);

                testEntry = buildEntity(testUser, LocalDate.of(2026, 4, 23), 7, 4, "pollen");
        }

        @Test
        @DisplayName("POST /api/diary should create new diary entry")
        void createDiaryEntry_ShouldReturnCreatedEntry() throws Exception {
                String requestBody = buildDiaryEntryRequestBody(LocalDate.of(2026, 4, 23), 7, 4, "pollen");

                mockMvc.perform(post("/api/diary")
                                .with(user("testuser"))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.entryDate").value("2026-04-23"))
                                .andExpect(jsonPath("$.tracking.psyche.stressLevel").value(7))
                                .andExpect(jsonPath("$.tracking.health.otherAllergiesNotes").value("pollen"))
                                .andExpect(jsonPath("$.tracking.symptoms.itchiness").value(4))
                                .andExpect(jsonPath("$.createdAt").exists());
        }

        @Test
        @DisplayName("GET /api/diary/{id} should return diary entry")
        void getDiaryEntry_WhenExists_ShouldReturnEntry() throws Exception {
                DiaryEntry saved = diaryEntryRepository.save(testEntry);

                mockMvc.perform(get("/api/diary/{id}", saved.getId())
                                .with(user("testuser")))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                                .andExpect(jsonPath("$.entryDate").value("2026-04-23"))
                                .andExpect(jsonPath("$.tracking.psyche.stressLevel").value(7));
        }

        @Test
        @DisplayName("GET /api/diary/{id} should return 404 for non-existent entry")
        void getDiaryEntry_WhenNotExists_ShouldReturn404() throws Exception {
                mockMvc.perform(get("/api/diary/{id}", UUID.randomUUID())
                                .with(user("testuser")))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("GET /api/diary should return all diary entries")
        void getAllDiaryEntries_ShouldReturnList() throws Exception {
                diaryEntryRepository.save(testEntry);
                diaryEntryRepository.save(buildEntity(testUser, LocalDate.of(2026, 4, 24), 5, 2, "none"));

                mockMvc.perform(get("/api/diary")
                                .with(user("testuser")))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        @DisplayName("GET /api/diary should return entries filtered by date range")
        void getAllDiaryEntries_WithDateRange_ShouldReturnMatchingEntries() throws Exception {
                diaryEntryRepository.save(buildEntity(testUser, LocalDate.of(2026, 3, 31), 6, 5, "dust"));
                diaryEntryRepository.save(testEntry);
                diaryEntryRepository.save(buildEntity(testUser, LocalDate.of(2026, 4, 24), 5, 2, "none"));
                diaryEntryRepository.save(buildEntity(testUser, LocalDate.of(2026, 5, 1), 8, 7, "pollen"));

                mockMvc.perform(get("/api/diary")
                                .param("fromDate", "2026-04-01")
                                .param("toDate", "2026-04-30")
                                .with(user("testuser")))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(2))
                                .andExpect(jsonPath("$[0].entryDate").value("2026-04-23"))
                                .andExpect(jsonPath("$[1].entryDate").value("2026-04-24"));
        }

        @Test
        @DisplayName("GET /api/diary should reject incomplete or reversed date ranges")
        void getAllDiaryEntries_WithInvalidDateRange_ShouldReturn400() throws Exception {
                mockMvc.perform(get("/api/diary")
                                .param("fromDate", "2026-04-30")
                                .param("toDate", "2026-04-01")
                                .with(user("testuser")))
                                .andExpect(status().isBadRequest());

                mockMvc.perform(get("/api/diary")
                                .param("fromDate", "2026-04-01")
                                .with(user("testuser")))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("GET /api/diary should only return entries for authenticated user")
        void getAllDiaryEntries_ShouldFilterByOwner() throws Exception {
                AppUser otherUser = new AppUser();
                otherUser.setUsername("ownerfilter");
                otherUser.setPassword("password123");
                otherUser.setEmail("ownerfilter@example.com");
                otherUser = appUserRepository.save(otherUser);

                diaryEntryRepository.save(buildEntity(testUser, LocalDate.of(2026, 4, 23), 7, 4, "pollen"));
                diaryEntryRepository.save(buildEntity(otherUser, LocalDate.of(2026, 4, 23), 2, 2, "none"));

                mockMvc.perform(get("/api/diary")
                                .with(user("testuser")))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1));
        }

        @Test
        @DisplayName("PUT /api/diary/{id} should update diary entry")
        void updateDiaryEntry_ShouldReturnUpdatedEntry() throws Exception {
                DiaryEntry saved = diaryEntryRepository.save(testEntry);
                String requestBody = buildDiaryEntryRequestBody(LocalDate.of(2026, 4, 25), 9, 6, "dust");

                mockMvc.perform(put("/api/diary/{id}", saved.getId())
                                .with(user("testuser"))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                                .andExpect(jsonPath("$.entryDate").value("2026-04-25"))
                                .andExpect(jsonPath("$.tracking.psyche.stressLevel").value(9))
                                .andExpect(jsonPath("$.tracking.contactFactors.showerNotes").value("yes"))
                                .andExpect(jsonPath("$.tracking.contactFactors.clothingNotes").value("cotton"))
                                .andExpect(jsonPath("$.tracking.contactFactors.animalContactNotes").value("none"))
                                .andExpect(jsonPath("$.tracking.symptoms.itchiness").value(6))
                                .andExpect(jsonPath("$.tracking.health.otherAllergiesNotes").value("dust"));
        }

        @Test
        @DisplayName("PUT /api/diary/{id} should return 404 when entry belongs to another user")
        void updateDiaryEntry_OtherUserEntry_ShouldReturn404() throws Exception {
                AppUser otherUser = new AppUser();
                otherUser.setUsername("otherupdater");
                otherUser.setPassword("password123");
                otherUser.setEmail("otherupdater@example.com");
                otherUser = appUserRepository.save(otherUser);

                DiaryEntry otherUsersEntry = diaryEntryRepository.save(
                                buildEntity(otherUser, LocalDate.of(2026, 4, 23), 5, 2, "none"));

                String requestBody = buildDiaryEntryRequestBody(LocalDate.of(2026, 4, 24), 8, 4, "dust");

                mockMvc.perform(put("/api/diary/{id}", otherUsersEntry.getId())
                                .with(user("testuser"))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("PUT /api/diary/{id} should allow keeping the same date for the same entry")
        void updateDiaryEntry_SameDateSameEntry_ShouldReturnOk() throws Exception {
                DiaryEntry saved = diaryEntryRepository.save(testEntry);
                String requestBody = buildDiaryEntryRequestBody(LocalDate.of(2026, 4, 23), 9, 6, "dust");

                mockMvc.perform(put("/api/diary/{id}", saved.getId())
                                .with(user("testuser"))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(saved.getId().toString()))
                                .andExpect(jsonPath("$.entryDate").value("2026-04-23"));
        }

        @Test
        @DisplayName("POST /api/diary should return 201 when creating entry on duplicate date for same user (upsert)")
        void createDiaryEntry_DuplicateDateForSameUser_ShouldReturn201() throws Exception {
                diaryEntryRepository.save(testEntry);
                String requestBody = buildDiaryEntryRequestBody(LocalDate.of(2026, 4, 23), 6, 3, "dust");

                mockMvc.perform(post("/api/diary")
                                .with(user("testuser"))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("POST /api/diary should allow same date for different users")
        void createDiaryEntry_SameDateDifferentUsers_ShouldReturnCreated() throws Exception {
                AppUser otherUser = new AppUser();
                otherUser.setUsername("othercreator");
                otherUser.setPassword("password123");
                otherUser.setEmail("othercreator@example.com");
                appUserRepository.save(otherUser);

                diaryEntryRepository.save(testEntry);
                String requestBody = buildDiaryEntryRequestBody(LocalDate.of(2026, 4, 23), 5, 3, "none");

                mockMvc.perform(post("/api/diary")
                                .with(user("othercreator"))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("GET /api/diary/{id} should return 404 when entry belongs to another user")
        void getDiaryEntry_OtherUserEntry_ShouldReturn404() throws Exception {
                AppUser otherUser = new AppUser();
                otherUser.setUsername("otheruser");
                otherUser.setPassword("password123");
                otherUser.setEmail("other@example.com");
                otherUser = appUserRepository.save(otherUser);

                DiaryEntry otherUsersEntry = buildEntity(otherUser, LocalDate.of(2026, 4, 23), 5, 3, "none");
                DiaryEntry saved = diaryEntryRepository.save(otherUsersEntry);

                mockMvc.perform(get("/api/diary/{id}", saved.getId())
                                .with(user("testuser")))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("PUT /api/diary/{id} should return 200 when moving to an already used date")
        void updateDiaryEntry_DuplicateDate_ShouldReturn200() throws Exception {
                diaryEntryRepository.save(buildEntity(testUser, LocalDate.of(2026, 4, 23), 7, 4, "pollen"));
                DiaryEntry secondEntry = diaryEntryRepository
                                .save(buildEntity(testUser, LocalDate.of(2026, 4, 24), 5, 2, "none"));

                String requestBody = buildDiaryEntryRequestBody(LocalDate.of(2026, 4, 23), 6, 3, "dust");

                mockMvc.perform(put("/api/diary/{id}", secondEntry.getId())
                                .with(user("testuser"))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("DELETE /api/diary/{id} should delete diary entry")
        void deleteDiaryEntry_ShouldReturn204() throws Exception {
                DiaryEntry saved = diaryEntryRepository.save(testEntry);

                mockMvc.perform(delete("/api/diary/{id}", saved.getId())
                                .with(user("testuser"))
                                .with(csrf()))
                                .andExpect(status().isNoContent());

                mockMvc.perform(get("/api/diary/{id}", saved.getId())
                                .with(user("testuser")))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("DELETE /api/diary/{id} should return 404 when entry belongs to another user")
        void deleteDiaryEntry_OtherUserEntry_ShouldReturn404() throws Exception {
                AppUser otherUser = new AppUser();
                otherUser.setUsername("otherdeleter");
                otherUser.setPassword("password123");
                otherUser.setEmail("otherdeleter@example.com");
                otherUser = appUserRepository.save(otherUser);

                DiaryEntry otherUsersEntry = diaryEntryRepository.save(
                                buildEntity(otherUser, LocalDate.of(2026, 4, 23), 5, 3, "none"));

                mockMvc.perform(delete("/api/diary/{id}", otherUsersEntry.getId())
                                .with(user("testuser"))
                                .with(csrf()))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("POST /api/diary with invalid data should return 400")
        void createDiaryEntry_WithInvalidData_ShouldReturn400() throws Exception {
                String requestBody = buildDiaryEntryRequestBody(LocalDate.of(2026, 4, 23), 7, 11, "pollen");

                mockMvc.perform(post("/api/diary")
                                .with(user("testuser"))
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Accessing endpoints without authentication should return 401")
        void accessWithoutAuth_ShouldReturn401() throws Exception {
                mockMvc.perform(get("/api/diary"))
                                .andExpect(status().isUnauthorized());
        }

        private DiaryEntry buildEntity(AppUser user, LocalDate entryDate, int stressLevel, int itchiness,
                        String allergies) {
                DiaryEntry entry = new DiaryEntry();
                entry.setUser(user);
                entry.setEntryDate(entryDate);
                entry.setStressLevel(stressLevel);
                entry.setSleep(6);
                entry.setMentalStrain(5);
                entry.setContactShower(true);
                entry.setContactShowerNotes("yes");
                entry.setContactClothing(true);
                entry.setContactClothingNotes("cotton");
                entry.setContactAnimal(false);
                entry.setContactAnimalNotes("none");
                entry.setCustomContactFactors(List.of("dust"));
                entry.setNutritionNuts(false);
                entry.setNutritionNutsNotes("no");
                entry.setNutritionFruits(true);
                entry.setNutritionFruitsNotes("yes");
                entry.setNutritionShellfish(false);
                entry.setNutritionShellfishNotes("no");
                entry.setNutritionDairy(true);
                entry.setNutritionDairyNotes("yes");
                entry.setNutritionGluten(false);
                entry.setNutritionGlutenNotes("no");
                entry.setCustomNutritionFactors(List.of("coffee"));
                entry.setCareSkinCare(true);
                entry.setCareSkinCareNotes("basic");
                entry.setCareHairProducts(false);
                entry.setCareHairProductsNotes("none");
                entry.setCareSoapShampoo(true);
                entry.setCareSoapShampooNotes("sensitive");
                entry.setCareCosmetics(false);
                entry.setCareCosmeticsNotes("none");
                entry.setCustomCareProducts(List.of("cream-a"));
                entry.setHealthOtherAllergies(true);
                entry.setHealthOtherAllergiesNotes(allergies);
                entry.setHealthInfections(false);
                entry.setHealthInfectionsNotes("none");
                entry.setSymptomItchiness(itchiness);
                entry.setSymptomScratch(true);
                entry.setSymptomInflammation(3);
                entry.setSymptomDryness(2);
                entry.setSymptomWeepingSkin(false);
                entry.setSymptomSkinCracks(false);
                entry.setSymptomSpreadPhotoUrls(List.of("https://example.com/p1.jpg"));
                return entry;
        }

        private String buildDiaryEntryRequestBody(LocalDate entryDate, int stressLevel, int itchiness, String allergies)
                        throws Exception {
                ObjectNode root = objectMapper.createObjectNode();
                root.put("entryDate", entryDate.toString());

                ObjectNode tracking = root.putObject("tracking");

                ObjectNode psyche = tracking.putObject("psyche");
                psyche.put("stressLevel", stressLevel);
                psyche.put("sleep", 6);
                psyche.put("mentalStrain", 5);

                ObjectNode contactFactors = tracking.putObject("contactFactors");
                contactFactors.put("shower", true);
                contactFactors.put("showerNotes", "yes");
                contactFactors.put("clothing", true);
                contactFactors.put("clothingNotes", "cotton");
                contactFactors.put("animalContact", false);
                contactFactors.put("animalContactNotes", "none");
                ArrayNode customContactFactors = contactFactors.putArray("customContactFactors");
                customContactFactors.add("dust");

                ObjectNode nutrition = tracking.putObject("nutrition");
                nutrition.put("nuts", false);
                nutrition.put("nutsNotes", "no");
                nutrition.put("fruits", true);
                nutrition.put("fruitsNotes", "yes");
                nutrition.put("shellfish", false);
                nutrition.put("shellfishNotes", "no");
                nutrition.put("dairy", true);
                nutrition.put("dairyNotes", "yes");
                nutrition.put("gluten", false);
                nutrition.put("glutenNotes", "no");
                ArrayNode customNutritionFactors = nutrition.putArray("customNutritionFactors");
                customNutritionFactors.add("coffee");

                ObjectNode careProducts = tracking.putObject("careProducts");
                careProducts.put("skinCare", true);
                careProducts.put("skinCareNotes", "basic");
                careProducts.put("hairProducts", false);
                careProducts.put("hairProductsNotes", "none");
                careProducts.put("soapShampoo", true);
                careProducts.put("soapShampooNotes", "sensitive");
                careProducts.put("cosmetics", false);
                careProducts.put("cosmeticsNotes", "none");
                ArrayNode customCareProducts = careProducts.putArray("customCareProducts");
                customCareProducts.add("cream-a");

                ObjectNode health = tracking.putObject("health");
                health.put("otherAllergies", true);
                health.put("otherAllergiesNotes", allergies);
                health.put("infections", false);
                health.put("infectionsNotes", "none");

                ObjectNode symptoms = tracking.putObject("symptoms");
                symptoms.put("itchiness", itchiness);
                symptoms.put("scratch", true);
                symptoms.put("inflammation", 3);
                symptoms.put("dryness", 2);
                symptoms.put("weepingSkin", false);
                symptoms.put("skinCracks", false);
                ArrayNode spreadPhotoUrls = symptoms.putArray("spreadPhotoUrls");
                spreadPhotoUrls.add("https://example.com/p1.jpg");

                return objectMapper.writeValueAsString(root);
        }
}
