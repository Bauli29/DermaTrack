# Statistics: Datenfluss, Berechnungen und Dashboard-Zusammenhang

Stand: 2026-05-05

Dieses Dokument beschreibt, wie die Statistics-Seite unter `/statistics` und die Statistics-Bausteine auf dem Dashboard `/` aktuell funktionieren. Es beschreibt die implementierte Logik im Code, nicht die komplette langfristige Produktvision aus dem Wiki.

## Kurzfassung

Die Statistics werden nicht aus Mock-JSON im Frontend berechnet. Grundlage sind echte `DiaryEntry`-Datensätze des angemeldeten Users aus dem Backend. Das Backend filtert diese Einträge nach Zeitraum, baut daraus Chart-Daten und berechnet Faktor-Auswertungen. Das Frontend ruft diese Daten über eigene Next.js API-Routen ab, validiert die Response, formatiert sie für die UI und lässt Highcharts die Diagramme rendern.

Für lokale Entwicklung werden `testuser1` und `testuser2` mit Beispiel-Diary-Einträgen befüllt. Diese Mockdaten kommen aus dem Backend-Seed und decken aktuell 365 Tage pro Demo-User ab. In echten Umgebungen entstehen die Daten durch Daily Tracking.

## Beteiligte Codebereiche

Backend:

- `backend/src/main/java/de/dermatrack/backend/statistics/api/controller/IStatisticsController.java`
- `backend/src/main/java/de/dermatrack/backend/statistics/api/controller/StatisticsController.java`
- `backend/src/main/java/de/dermatrack/backend/statistics/service/impl/StatisticsService.java`
- `backend/src/main/java/de/dermatrack/backend/statistics/mapper/StatisticsLineChartMapper.java`
- `backend/src/main/java/de/dermatrack/backend/statistics/mapper/StatisticsBarChartMapper.java`
- `backend/src/main/java/de/dermatrack/backend/statistics/service/impl/WeightedSymptomCalculator.java`
- `backend/src/main/java/de/dermatrack/backend/statistics/service/impl/CorrelationCalculator.java`
- `backend/src/main/java/de/dermatrack/backend/diary/model/DiaryEntry.java`
- `backend/src/main/java/de/dermatrack/backend/diary/repository/IDiaryEntryRepository.java`
- `backend/src/main/java/de/dermatrack/backend/diary/mock/DiaryEntryMock.java`

Frontend:

- `frontend/src/app/api/statistics/_utils.ts`
- `frontend/src/app/api/statistics/psyche-symptoms/route.ts`
- `frontend/src/app/api/statistics/symptoms/route.ts`
- `frontend/src/app/api/statistics/factor-impacts/route.ts`
- `frontend/src/services/statistics/index.ts`
- `frontend/src/services/statistics/types.ts`
- `frontend/src/components/templates/statistics/index.tsx`
- `frontend/src/components/templates/statistics/utils.ts`
- `frontend/src/components/templates/statistics/statistics-chart-card.tsx`
- `frontend/src/components/templates/statistics/factor-distribution-chart-card.tsx`
- `frontend/src/components/templates/dashboard/index.tsx`
- `frontend/src/components/templates/dashboard/utils.ts`

## Datenquelle

Die fachliche Quelle sind `DiaryEntry`-Datensätze. Jeder Eintrag gehört einem User und hat ein `entryDate`. Die relevanten Felder sind:

- Psyche: `mentalStrain`, `stressLevel`, `sleep`
- Symptome als Scores: `symptomItchiness`, `symptomDryness`, `symptomInflammation`
- Symptome als Boolean: `symptomScratch`, `symptomWeepingSkin`, `symptomSkinCracks`
- Faktoren: Kontakt, Ernährung, Pflege und Gesundheit, zum Beispiel `contactShower`, `nutritionDairy`, `careSkinCare`, `healthInfections`

Das Backend liest Statistics immer user-bezogen:

```text
findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc(userId, fromDate, toDate)
```

Dadurch fließen nur Einträge des aktuell authentifizierten Users in die Statistik ein.

## API-Endpunkte

Das Backend stellt drei Statistics-Endpunkte bereit. Wegen des globalen API-Prefixes sind sie nach außen unter `/api/statistics/...` erreichbar:

```text
GET /api/statistics/psyche-symptoms
GET /api/statistics/symptoms
GET /api/statistics/factor-impacts
```

Alle drei Endpunkte akzeptieren dieselben optionalen Query-Parameter:

```text
period=7d|30d|90d|6m|1y
endDate=YYYY-MM-DD
fromDate=YYYY-MM-DD
```

Regeln:

- Ohne `endDate` nimmt das Backend das heutige Datum.
- Ohne `period` nimmt das Backend `30d`.
- Bei festen Perioden berechnet das Backend `fromDate = endDate - (periodDays - 1)`.
- `fromDate` ist eine Custom-Range und überschreibt `period`.
- `fromDate` und `endDate` sind inklusiv.
- Wenn `fromDate` nach `endDate` liegt, wird das als Fehler behandelt.

Das Frontend hat eigene Next.js API-Routen mit denselben Pfaden. Diese Routen lesen das Access Token aus `HttpOnly` Cookies, validieren die Query-Parameter und leiten die Anfrage mit `Authorization: Bearer ...` an das Backend weiter.

## Chart-Response-Format

Die beiden Chart-Endpunkte liefern ein gemeinsames Format:

```json
{
  "chartType": "line",
  "categories": ["2026-04-01", "2026-04-02"],
  "series": [{ "name": "Mental Strain", "data": [4, 6] }],
  "dateRange": {
    "from": "2026-04-01",
    "to": "2026-04-30"
  },
  "dataQuality": {
    "dataPointCount": 30,
    "minimumRecommendedDataPoints": 7,
    "insufficientData": false
  }
}
```

`categories` enthält jeden Kalendertag im ausgewählten Zeitraum. Wenn es für einen Tag keinen Diary-Eintrag gibt, wird für diesen Tag in den Serien `null` gesetzt. Dadurch bleibt die Zeitachse vollständig, aber Highcharts sieht Datenlücken.

## Psyche & Symptoms Chart

Endpoint:

```text
GET /api/statistics/psyche-symptoms
```

Backend-Mapping:

- Chart-Typ: `line`
- Serien:
  - `Mental Strain` aus `DiaryEntry.mentalStrain`
  - `Stress Level` aus `DiaryEntry.stressLevel`
  - `Sleep` aus `DiaryEntry.sleep`
  - `Weighted Symptoms` aus der gewichteten Symptomformel

Diese Kurve kombiniert also psychische Werte mit einem berechneten Symptom-Gesamtscore.

## Symptoms Chart

Endpoint:

```text
GET /api/statistics/symptoms
```

Backend-Mapping:

- Chart-Typ: `column`
- Serien:
  - `Itchiness` aus `DiaryEntry.symptomItchiness`
  - `Dryness` aus `DiaryEntry.symptomDryness`
  - `Inflammation` aus `DiaryEntry.symptomInflammation`

Dieser Chart zeigt aktuell nur die drei numerischen Symptom-Scores. Boolean-Symptome wie Kratzen oder Hautrisse fließen nicht als eigene Balkenserie ein, sondern nur in den gewichteten Symptomscore.

## Gewichteter Symptomscore

Der gewichtete Symptomscore wird im Backend in `WeightedSymptomCalculator` berechnet. Er ist eine selbst gebaute fachliche Heuristik, kein medizinisches Modell und kein Machine-Learning-Modell.

Formel:

```text
weightedSymptoms =
  itchiness * 0.20
+ dryness * 0.10
+ inflammation * 0.30
+ scratchingRating * 0.10
+ weepingSkinRating * 0.15
+ skinCracksRating * 0.15
```

Details:

- Numerische Scores werden auf `0..10` begrenzt.
- Boolean-Symptome werden als `true = 10` und `false/null = 0` behandelt.
- Das Endergebnis wird ebenfalls auf `0..10` begrenzt.
- Die Gewichte summieren sich zu `1.0`.

Aktuelle Gewichtung:

| Symptom      | Gewicht |
| ------------ | ------: |
| Itchiness    |     20% |
| Dryness      |     10% |
| Inflammation |     30% |
| Scratching   |     10% |
| Weeping skin |     15% |
| Skin cracks  |     15% |

## Factor Impact Statistics

Endpoint:

```text
GET /api/statistics/factor-impacts
```

Dieser Endpoint analysiert, wie häufig bestimmte Faktoren im Zeitraum vorkommen und wie sie mit dem gewichteten Symptomscore zusammenhängen.

Response-Format:

```json
{
  "dateRange": {
    "from": "2026-04-01",
    "to": "2026-04-30"
  },
  "totalEntries": 30,
  "averageWeightedSymptomScore": 4.35,
  "dataQuality": {
    "dataPointCount": 30,
    "minimumRecommendedDataPoints": 7,
    "insufficientData": false
  },
  "factors": [
    {
      "key": "nutrition.dairy",
      "label": "Dairy",
      "category": "Nutrition",
      "totalEntries": 30,
      "occurrenceCount": 12,
      "occurrenceRate": 40.0,
      "averageWeightedSymptomScore": 5.1,
      "weightedSymptomDelta": 0.75,
      "pearsonCorrelation": 0.32
    }
  ]
}
```

### Faktor-Scores

Das Backend wandelt Faktoren zuerst in numerische Scores um:

| Faktorart           | Werte                                                |
| ------------------- | ---------------------------------------------------- |
| Presence            | `none`, leer oder `null` = 0; sonst 1                |
| Nutrition intensity | `none` = 0, `low` = 1, `medium` = 2, `high` = 3      |
| Care intensity      | `none` = 0, `mild` = 1, `intense` = 3                |
| Shower              | `cold` = 1, `warm` = 2, `hot` = 3                    |
| Clothing            | `none` = 0, `synthetic` = 1, `tight` = 2, `wool` = 3 |

Analysierte Faktorgruppen:

- Contact: shower, clothing, animal contact
- Nutrition: nuts, fruits, shellfish, dairy, gluten
- Care: skin care, hair products, soap and shampoo, cosmetics
- Health: other allergies, infections

### Berechnete Kennzahlen pro Faktor

Für jeden Faktor berechnet das Backend:

- `occurrenceCount`: Anzahl der Tage, an denen der Faktor-Score größer als 0 ist.
- `occurrenceRate`: Anteil dieser Tage an allen Einträgen im Zeitraum, in Prozent.
- `averageWeightedSymptomScore`: Durchschnittlicher gewichteter Symptomscore nur an Tagen, an denen der Faktor vorkam.
- `weightedSymptomDelta`: Differenz zwischen Faktor-Durchschnitt und Gesamt-Durchschnitt im Zeitraum.
- `pearsonCorrelation`: Pearson-Korrelation zwischen Faktor-Score und gewichteter Symptomscore-Serie.

Die Korrelation wird mit Apache Commons Math berechnet. Das ist eine bestehende Mathematik-Library. Die Entscheidung, welche Datenreihen korreliert werden, welche Faktoren ausgewertet werden und wie sie in Score-Werte übersetzt werden, ist selbst gebaut.

Wichtig: Die Faktor-Auswertung zeigt statistische Signale, keine Kausalität. Ein positiver Delta- oder Korrelationswert bedeutet nicht automatisch, dass der Faktor die Symptome verursacht.

### Sortierung

Die Faktoren werden im Backend sortiert nach:

1. Betrag der Pearson-Korrelation, absteigend
2. Betrag des gewichteten Symptom-Deltas, absteigend
3. Label alphabetisch

Das Frontend zeigt in der Factor-Insights-Liste danach die ersten passenden Faktoren nach Filterung.

## Datenqualität

Alle Statistics-Responses enthalten:

```text
dataPointCount
minimumRecommendedDataPoints
insufficientData
```

Aktuell gilt:

```text
minimumRecommendedDataPoints = 7
insufficientData = dataPointCount < 7
```

Die Statistics-Seite zeigt bei zu wenigen Datenpunkten eine Warnung. Die Daten werden trotzdem angezeigt, weil auch wenige Einträge für eine Vorschau nützlich sein können. Besonders Korrelationen sind bei kleinen Stichproben aber fachlich schwach.

## Frontend Statistics-Seite

Die Seite `/statistics` ist eine Client-Komponente. Sie hält folgende UI-Zustände:

- ausgewähltes Enddatum, standardmäßig heute
- Zeitraum: `7d`, `30d`, `90d`, `6m`, `1y` oder `custom`
- Custom-Startdatum, wenn `custom` aktiv ist
- Faktorfilter nach Kategorie
- Faktorfilter nach Signal
- Loading-, Error- und Empty-State

Bei jeder Änderung von Zeitraum oder Enddatum lädt die Seite parallel:

```text
fetchPsycheSymptomsChart(...)
fetchSymptomsChart(...)
fetchFactorImpacts(...)
```

Die Fetch-Funktionen nutzen `sessionAwareFetch`. Wenn ein Access Token abgelaufen ist, versucht der Client einmal einen Silent Refresh über die Auth-Mechanik und wiederholt dann die Anfrage.

Die Responses werden im Frontend mit Zod validiert. Wenn das Backend eine unerwartete Response liefert, zeigt die UI einen Fehler statt fehlerhafte Daten still zu rendern.

## Highcharts und eigene Chart-Logik

Die sichtbaren Diagramme, Achsen, Legenden, Tooltips, Zoom/Pan und PNG/PDF-Chart-Exports kommen von Highcharts und `@highcharts/react`.

Selbst gebaut ist:

- welche Daten vom Backend geliefert werden
- welche Serien in welchem Chart landen
- die Highcharts-Optionsobjekte
- Farben aus dem DermaTrack-Theme
- Datumsformatierung der x-Achse
- Score-Achse `0..10`
- zusätzliche y-Achsen-Konfiguration, damit Werte bei `0` sichtbar bleiben
- responsive Größenanpassung mit `ResizeObserver`
- Empty States
- die Series-Snapshot-Chips oberhalb der Charts

Die Achsen werden nicht manuell gezeichnet. Highcharts rendert sie. Wir geben Highcharts aber konkrete Optionen, zum Beispiel:

- x-Achsen-Kategorien aus den Backend-Daten
- reduzierte Tick-Positionen bei langen Zeiträumen
- y-Achse mit sichtbarem Score-Bereich `0..10`
- eine Plotline bei `0`
- deaktivierte Animationen
- aktiviertes x-Zooming und x-Panning

Die Highcharts-Zusatzmodule werden im Frontend über ESM-Pfade importiert:

```ts
import "highcharts/esm/modules/exporting.src.js";
import "highcharts/esm/modules/offline-exporting.src.js";
```

Das ist wichtig für Next.js/Turbopack und `@highcharts/react`. Die nicht-ESM-Imports aus `highcharts/modules/...` können in diesem Setup im Browser mit `_Highcharts is undefined` fehlschlagen.

## Factor Distribution Chart

Der Factor Distribution Chart ist ein Pie Chart auf der Statistics-Seite.

Die Daten dafür kommen nicht als eigener Backend-Endpoint. Das Frontend baut sie aus der bestehenden `factor-impacts` Response:

1. Alle Faktoren mit `occurrenceCount <= 0` werden ignoriert.
2. Die übrigen Faktoren werden nach `category` gruppiert.
3. Pro Kategorie werden die `occurrenceCount`-Werte summiert.
4. Das Ergebnis wird als Highcharts Pie-Serie gerendert.

Beispiel:

```text
Contact: 42 occurrences
Nutrition: 63 occurrences
Care: 38 occurrences
Health: 18 occurrences
```

Auch dieser Chart wird von Highcharts gerendert. Die Gruppierung ist eigene Frontend-Logik.

## Filter und Export

Die Factor-Insights-Filter sind clientseitig:

- Kategorie: `all`, `Contact`, `Nutrition`, `Care`, `Health`
- Signal:
  - `higher`: gewichteter Symptom-Delta >= 0.1
  - `lower`: gewichteter Symptom-Delta <= -0.1
  - `neutral`: kein Delta oder Betrag < 0.1

Diese Filter lösen aktuell keinen neuen Backend-Request aus. Es wird die bereits geladene `factor-impacts` Response gefiltert.

CSV-Export ist eigene Frontend-Logik. Die CSV enthält:

- alle Chart-Serienwerte aus `psyche-symptoms`
- alle Chart-Serienwerte aus `symptoms`
- alle Faktor-Kennzahlen aus `factor-impacts`

PNG- und PDF-Export der Charts werden über Highcharts Offline Exporting ausgelöst.

## Dashboard-Integration

Das Dashboard `/` hat keinen eigenen Dashboard-Backend-Endpoint. Es baut seine Kennzahlen aus bereits vorhandenen Services:

```text
fetchDiaryEntries()
fetchPsycheSymptomsChart({ period: '30d' })
fetchFactorImpacts({ period: '30d' })
```

Das Dashboard verwendet bewusst immer die 30-Tage-Statistics. Es lädt nicht den Symptoms-Column-Chart, weil es für die Übersicht nur den gewichteten Symptomtrend und die Faktor-Signale braucht.

### Dashboard-Kennzahlen

`Tracking history`:

- basiert auf allen geladenen Diary-Einträgen
- zählt eindeutige `entryDate`-Werte
- berechnet die Wochen aus dem Abstand zwischen erstem und letztem Eintrag

`Average symptom score`:

- kommt aus `factorImpacts.averageWeightedSymptomScore`
- entspricht dem Durchschnitt des gewichteten Symptomscore im 30-Tage-Fenster

`30-day trend`:

- sucht in `psycheSymptoms.series` die Serie `Weighted Symptoms`
- nimmt den ersten vorhandenen und den letzten vorhandenen Wert im 30-Tage-Fenster
- berechnet `trendDelta = latest - first`
- Bewertung:
  - `trendDelta <= -0.5`: Improving
  - `trendDelta >= 0.5`: Worsening
  - sonst: Stable
  - wenn keine Werte vorhanden sind: No trend yet

`Potential trigger`:

- nimmt die Faktor-Auswertung der letzten 30 Tage
- bevorzugt Faktoren mit `occurrenceCount > 0` und positivem `weightedSymptomDelta`
- sortiert diese nach Delta, danach Korrelation, danach Häufigkeit
- wenn es keinen positiven Faktor gibt, wird der häufigste vorkommende Faktor als Fallback genommen

`Sample quality`:

- kommt direkt aus `factorImpacts.dataQuality`
- zeigt an, ob die 30-Tage-Stichprobe mindestens 7 Datenpunkte enthält

## Was wir selbst gebaut haben

Selbst gebaut im Projekt:

- Statistics Backend-Endpoints
- Zeitraumauflösung mit `period`, `endDate`, `fromDate`
- user-bezogene DiaryEntry-Abfrage
- Mapping von DiaryEntry-Daten in Chart-Responses
- gewichtete Symptomscore-Formel
- Faktor-Definitionen und Faktor-Score-Mapping
- Faktor-Kennzahlen inklusive Delta und Sortierung
- Data-Quality-Metadaten
- Next.js Statistics-Proxies
- Frontend Statistics-Service mit Zod-Validierung
- Statistics-Seite, Filter, States und CSV-Export
- Factor Distribution Gruppierung
- Dashboard-Summary-Logik
- Highcharts-Optionsobjekte und Theme-Anbindung

## Worauf wir zurückgreifen

Bestehende Libraries und Frameworks:

- Spring Boot für Backend-Web/API-Struktur
- Spring Data JPA für Repository-Abfragen
- Spring Security/JWT-Infrastruktur für Authentifizierung
- Apache Commons Math für Pearson-Korrelation
- Next.js und React für Frontend-Routing und UI
- Zod für Runtime-Validierung im Frontend
- Highcharts und `@highcharts/react` für Chart-Rendering, Achsen, Legenden, Tooltips, Zoom/Pan und Chart-Export
- `react-datepicker` für Kalenderauswahl
- DataFaker für lokale Seed-/Mockdaten

## Bewusste Grenzen

Aktuell nicht enthalten:

- keine medizinische Diagnose
- keine Kausalitätsaussage bei Faktoren
- kein Machine Learning
- keine serverseitige Dashboard-Aggregation
- keine Backend-Caching-Schicht für lange Zeiträume
- keine Timeline-Integration
- keine Backend-Filter für einzelne Faktoren oder Symptome
- keine eigene serverseitige PDF-Erstellung

Die aktuelle Statistics-Implementierung ist damit eine selbst gebaute Analytics-Schicht auf DiaryEntry-Daten, mit Highcharts als Rendering- und Export-Library.
