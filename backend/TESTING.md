# Unit Testing für DermaTrack Backend

Dieses Projekt verwendet **JUnit 5** (Jupiter) für Unit- und Integrationstests.

## Test-Struktur

### 1. **Unit Tests** (mit Mockito)
- Testen einzelne Komponenten isoliert
- Verwenden Mocks für Dependencies
- Schnell und ohne Datenbank
- Beispiel: `DiaryServiceTest.java`

### 2. **Model Tests**
- Validierungstests für Entities
- Testen Business-Logik in Models
- Beispiel: `DiaryEntryTest.java`

### 3. **Integration Tests**
- Testen komplette Controller-Flows
- Verwenden echten Spring Context
- Mit In-Memory H2 Datenbank mit Rollback 
- Beispiel: `DiaryControllerIntegrationTest.java`

## Tests ausführen

### Alle Tests ausführen
```bash
./mvnw test
```

oder mit Gradle:
```bash
./gradlew test
```

### Einzelne Test-Klasse ausführen
```bash
./mvnw test -Dtest=DiaryServiceTest
```

### Bestimmte Test-Methode ausführen
```bash
./mvnw test -Dtest=DiaryServiceTest#findById_WhenEntryExists_ShouldReturnEntry
```

### Tests mit Coverage-Report
```bash
./mvnw test
```

Der Coverage-Report wird automatisch bei jedem Test-Durchlauf erstellt und ist hier zu finden:
```
backend/target/site/jacoco/index.html
```

Öffne die `index.html` im Browser, um den vollständigen Report zu sehen mit:
- **Line Coverage** - Zeilen-Abdeckung
- **Branch Coverage** - Verzweigungs-Abdeckung
- **Method Coverage** - Methoden-Abdeckung
- **Class Coverage** - Klassen-Abdeckung

## Wichtige Annotationen

### JUnit 5
- `@Test` - Markiert eine Test-Methode
- `@BeforeEach` - Wird vor jedem Test ausgeführt
- `@AfterEach` - Wird nach jedem Test ausgeführt
- `@DisplayName` - Lesbare Beschreibung des Tests
- `@Disabled` - Deaktiviert einen Test temporär

### Mockito
- `@Mock` - Erstellt ein Mock-Objekt
- `@InjectMocks` - Injiziert Mocks in das zu testende Objekt
- `@ExtendWith(MockitoExtension.class)` - Aktiviert Mockito

### Spring Boot Tests
- `@SpringBootTest` - Lädt vollständigen Spring Context
- `@AutoConfigureMockMvc` - Konfiguriert MockMvc für Controller-Tests
- `@ActiveProfiles("test")` - Verwendet application-test.yml
- `@Transactional` - Rollback nach jedem Test
- `@WithMockUser` - Mock-Authentifizierung für Security-Tests

## Assertions mit AssertJ

```java
// Einfache Assertions
assertThat(result).isNotNull();
assertThat(result.getId()).isEqualTo(expectedId);
assertThat(list).hasSize(3);
assertThat(list).isEmpty();
assertThat(list).contains(entry1, entry2);

// Exception Assertions
assertThatThrownBy(() -> service.findById(id))
    .isInstanceOf(ResourceNotFoundException.class)
    .hasMessageContaining("DiaryEntry");
```

## Mockito Beispiele

```java
// Mock-Verhalten definieren
when(repository.findById(id)).thenReturn(Optional.of(entry));
when(repository.save(any(DiaryEntry.class))).thenReturn(entry);

// Verify-Aufrufe
verify(repository).findById(id);
verify(repository, times(2)).save(any());
verify(repository, never()).deleteById(any());
```

## MockMvc für Controller-Tests

```java
// GET Request
mockMvc.perform(get("/api/diary/{id}", id))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.id").value(id.toString()));

// POST Request
mockMvc.perform(post("/api/diary")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.allergies").value(5));
```

## Best Practices

1. **AAA-Pattern verwenden**: Arrange, Act, Assert
2. **Einen Aspekt pro Test**: Jeder Test sollte nur eine Sache prüfen
3. **Aussagekräftige Namen**: `methodName_condition_expectedResult`
4. **@DisplayName nutzen**: Für lesbare Testbeschreibungen
5. **Tests isoliert halten**: Keine Abhängigkeiten zwischen Tests
6. **Mock nur externe Dependencies**: Service-Layer sollte gemockt werden, nicht Business-Logik

## Test-Coverage

Ein guter Test-Coverage liegt bei:
- **Service Layer**: 80-90%
- **Controller**: 70-80%
- **Model/Entity**: 60-70%

## Weitere Tests erstellen

Um weitere Tests zu erstellen, folge diesem Muster:

1. Erstelle eine Test-Klasse mit gleichem Namen + `Test`
2. Verwende `@ExtendWith(MockitoExtension.class)` für Unit-Tests
3. Verwende `@SpringBootTest` für Integrationstests
4. Schreibe Tests für Happy Path und Error Cases
5. Teste Edge Cases und Validierungen

## Nützliche Ressourcen

- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [AssertJ Documentation](https://assertj.github.io/doc/)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)
