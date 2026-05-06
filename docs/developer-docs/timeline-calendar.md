# Timeline- und Calendar-Seite

Dieses Dokument beschreibt, wie die Timeline-/Calendar-Seite unter `/timeline`
funktioniert, woher ihre Daten kommen, welche Berechnungen stattfinden und
welche Rolle Highcharts spielt.

## Zweck der Seite

Die Timeline-Seite zeigt die Tage eines Monats als Kalender-Heatmap. Jeder Tag
des sichtbaren Monats kann ausgewählt werden. Für Tage mit gespeichertem
Diary-Eintrag wird ein Symptom-Score berechnet und farblich dargestellt. Der
ausgewählte Tag zeigt darunter Details und kann direkt in das Daily Tracking
geöffnet werden.

Die Seite ist eine geschützte Frontend-Route. Nicht eingeloggte Benutzer werden
über den bestehenden Auth-Guard auf die Login-Seite umgeleitet.

## Wichtige Dateien

- `frontend/src/app/timeline/page.tsx`: Next.js Route für `/timeline`.
- `frontend/src/components/templates/timeline/index.tsx`: Hauptkomponente der
  Seite, inklusive State, Monatsnavigation, Laden der Daten und Detailbereich.
- `frontend/src/components/templates/timeline/timeline-calendar-chart.tsx`:
  Client-only Wrapper um Highcharts.
- `frontend/src/components/templates/timeline/utils.ts`: Kalenderlogik,
  Score-Berechnung, Heatmap-Daten und Highcharts-Optionen.
- `frontend/src/components/templates/timeline/styles.ts`: Layout und Styling.
- `frontend/src/services/diary/index.ts`: Frontend-Service für Diary-Requests.
- `frontend/src/app/api/diary/route.ts` und
  `frontend/src/app/api/diary/_utils.ts`: Next.js API-Proxy zum Backend.
- `backend/src/main/java/de/dermatrack/backend/diary/api/controller/DiaryController.java`:
  Backend-Endpunkt für Diary-Einträge, inklusive Datumsbereich.
- `backend/src/main/java/de/dermatrack/backend/diary/service/DiaryService.java`:
  Diary-Service mit userbezogener Range-Abfrage.
- `backend/src/main/java/de/dermatrack/backend/diary/repository/IDiaryEntryRepository.java`:
  Spring-Data-Repository-Methode für den Datumsbereich.

## Datenfluss

1. Der Benutzer öffnet `/timeline`.
2. `frontend/src/app/timeline/page.tsx` rendert `TimelineTemplate`.
3. `TimelineTemplate` bestimmt den sichtbaren Monat. Initial ist das der
   aktuelle Monat, jeweils auf den ersten Tag normalisiert.
4. Aus dem sichtbaren Monat wird mit `getTimelineMonthRange` ein Datumsbereich
   erzeugt:
   - `fromDate`: erster Tag des Monats, zum Beispiel `2026-05-01`
   - `toDate`: letzter Tag des Monats, zum Beispiel `2026-05-31`
5. Die Komponente ruft
   `getDiaryEntries<IDiaryEntry>({ fromDate, toDate })` auf.
6. Der Frontend-Service baut daraus einen Request an:
   `/api/diary?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD`
7. Die Next.js API-Route liest die Query-Parameter und leitet sie über
   `secureFetch` an das Backend weiter. Dabei wird das Access Token aus dem
   Auth-Cookie als Bearer Token gesetzt.
8. Das Backend verarbeitet den Request auf `GET /diary`.
9. `DiaryController` löst den aktuellen Benutzer aus dem `Principal` auf.
10. Wenn beide Query-Parameter vorhanden und gültig sind, ruft der Controller
    `diaryService.findAllByUserIdAndDateRange(userId, fromDate, toDate)` auf.
11. `DiaryService` nutzt die Repository-Methode
    `findAllByUser_IdAndEntryDateBetweenOrderByEntryDateAsc`.
12. Die Datenbank liefert nur Einträge des aktuellen Benutzers im gewünschten
    Datumsbereich, sortiert nach `entryDate`.
13. Das Backend mapped die Entities auf `DiaryEntryResponse` und gibt sie an das
    Frontend zurück.
14. Das Frontend bereitet die Einträge in `utils.ts` für Kalender, Details und
    Highcharts auf.

Wichtig: Die Timeline lädt nicht alle Diary-Einträge, sondern immer nur den
gerade sichtbaren Monat.

## Datenmodell im Frontend

Die Timeline arbeitet mit `IDiaryEntry` aus
`frontend/src/types/diary/index.ts`. Für die Kalenderansicht sind vor allem
diese Felder relevant:

- `entryDate`: Datum des Eintrags im Format `YYYY-MM-DD`.
- `tracking.symptoms`: Symptomwerte für Score und Zusammenfassung.
- `tracking.psyche`, `contactFactors`, `nutrition`, `careProducts`, `health`:
  werden für die Anzahl der erfassten Faktoren verwendet.
- `notes`: wird im Detailbereich angezeigt, wenn vorhanden.
- `tracking.symptoms.spreadPhotoUrls`: wird als Bildliste im Detailbereich
  angezeigt, wenn vorhanden.

## Kalenderaufbereitung

Die eigentliche Kalenderstruktur bauen wir selbst in
`frontend/src/components/templates/timeline/utils.ts`.

`buildTimelineDays` erzeugt für jeden echten Tag des Monats ein Objekt:

- `date`: Datum als `YYYY-MM-DD`.
- `dayOfMonth`: Zahl des Kalendertages.
- `isFuture`: `true`, wenn das Datum nach heute liegt.
- `entry`: passender Diary-Eintrag oder `null`.
- `severity`: berechneter Symptom-Score oder `null`, wenn kein Eintrag
  vorhanden ist.

Die Entries werden vorher in einer `Map` nach `entryDate` abgelegt. Dadurch kann
jeder Kalendertag schnell seinem Diary-Eintrag zugeordnet werden.

Es werden keine künstlichen Kacheln vor oder nach dem Monat erzeugt. Leere
Flächen am Rand entstehen nur dadurch, dass ein Monat nicht exakt auf eine volle
Kalenderwoche passt. Die Heatmap-Daten selbst enthalten ausschließlich echte
Tage des sichtbaren Monats.

## Symptom-Score

Für Tage mit Diary-Eintrag berechnet `calculateTimelineSeverity` einen
gewichteten Symptom-Score von `0.0` bis `10.0`.

Die Gewichtung ist:

- `itchiness`: 20 Prozent
- `dryness`: 10 Prozent
- `inflammation`: 30 Prozent
- `scratch`: 10 Prozent
- `weepingSkin`: 15 Prozent
- `skinCracks`: 15 Prozent

Numerische Werte werden auf den Bereich `0` bis `10` begrenzt. Boolesche
Symptome werden als `10` gewertet, wenn sie `true` sind, sonst als `0`.

Der berechnete Wert wird ebenfalls auf `0` bis `10` begrenzt und auf eine
Nachkommastelle gerundet. Fehlen Symptomdaten, ist der Score `0`.

Dieser Score ist der Wert, den Highcharts als `value` für die Farbgebung der
Heatmap erhält.

## Detail-Zusammenfassung

Wenn ein Tag ausgewählt ist, berechnet `buildTimelineEntrySummary` die Inhalte
für den Detailbereich:

- `severity`: derselbe Symptom-Score wie in der Heatmap.
- `symptomSummary`: Text aus vorhandenen Symptomwerten, zum Beispiel
  `Itch 4, Inflammation 6`.
- `factorCount`: Anzahl der erfassten Werte in Psyche, Kontaktfaktoren,
  Ernährung, Pflegeprodukten und Gesundheit.
- `imageUrls`: Bild-URLs aus `symptoms.spreadPhotoUrls`.

Bei `factorCount` zählen gesetzte Werte. Arrays zählen, wenn sie mindestens
einen Eintrag enthalten. Leere Strings, `null` und `undefined` zählen nicht.

## Highcharts-Rolle

Highcharts übernimmt nicht die fachliche Kalenderlogik und berechnet auch keine
Scores. Diese Teile sind in der Anwendung selbst gebaut.

Highcharts wird für die Darstellung und Interaktion der Heatmap verwendet:

- Rendering der Kacheln als Heatmap.
- Farblegende über `colorAxis.dataClasses`.
- Tooltips.
- Data Labels für Tageszahl und Symptom-Score.
- Hover-Zustände.
- Klick-Events auf einzelne Tage.
- Accessibility-Unterstützung über das Highcharts-Accessibility-Modul.

Die verwendeten Module werden in
`timeline-calendar-chart.tsx` geladen:

- `highcharts/esm/modules/heatmap.src.js`
- `highcharts/esm/modules/accessibility.src.js`
- `@highcharts/react`

Die Seite verwendet also keine eigene Canvas- oder SVG-Implementierung für die
Heatmap. Die Daten, Optionen und fachlichen Regeln kommen aus unserer App; die
grafische Darstellung kommt von Highcharts.

## Highcharts-Datenpunkte

Highcharts Heatmap erwartet Punkte mit `x`, `y` und `value`. Diese Punkte werden
in `buildTimelineHeatmapData` erzeugt.

- `x`: Wochentag von `0` bis `6`, passend zu `Sun` bis `Sat`.
- `y`: Kalenderwoche innerhalb des Monats.
- `value`: Symptom-Score oder `null`.
- `custom`: fachliche Zusatzdaten für Tooltip, Labels und Klicklogik.

Die `y`-Koordinate wird so berechnet, dass die erste Kalenderwoche oben steht.
Die `xAxis` zeigt die Wochentage, die `yAxis` bleibt unsichtbar.

Tage ohne Diary-Eintrag haben `value: null`. Highcharts zeichnet sie mit
`nullColor`, also neutral statt als Schweregrad-Farbe. Tage mit Eintrag werden
je nach Score einer Farbklasse zugeordnet:

- niedrig: grün
- moderat: blau
- hoch: gelb
- schwer: rot

## Client-only Rendering

`TimelineCalendarChart` wird in `TimelineTemplate` per `next/dynamic` mit
`ssr: false` geladen. Das ist wichtig, weil Highcharts browsernahe APIs
verwendet und zuverlässig im Client gerendert werden soll.

Zusätzlich verwendet `TimelineCalendarChart` einen `ResizeObserver`. Wenn sich
die Größe der Kalenderfläche ändert, wird die Highcharts-Instanz per
`chart.setSize(...)` an die tatsächliche Größe angepasst. Dadurch bleibt die
Heatmap responsive.

## Bedienlogik

Die Seite verwaltet diese wichtigen States:

- `visibleMonth`: aktuell angezeigter Monat.
- `selectedDate`: aktuell ausgewählter Tag.
- `entries`: geladene Diary-Einträge für den sichtbaren Monat.
- `isLoading`: Ladezustand während des Monats-Requests.
- `error`: Fehlertext, falls das Laden fehlschlägt.
- `notice`: Hinweistext, zum Beispiel bei Auswahl eines zukünftigen Datums.
- `reloadKey`: technischer Zähler für Retry.

Die Monatsnavigation funktioniert so:

- `Previous`: zeigt den vorherigen Monat.
- `Today`: springt in den aktuellen Monat.
- `Next`: zeigt den nächsten Monat, ist aber deaktiviert, wenn der aktuell
  sichtbare Monat bereits der aktuelle Monat ist.

Bei einem Monatswechsel wird der ausgewählte Tag neu gesetzt:

- Wenn der neue Monat den heutigen Tag enthält, wird heute ausgewählt.
- Sonst wird der erste Tag des neuen Monats ausgewählt.

Ein Klick auf eine Kalenderkachel aktualisiert `selectedDate`. Für zukünftige
Tage wird ein Hinweis angezeigt und der Button zum Öffnen des Daily Trackings
ist deaktiviert.

## Verbindung zum Daily Tracking

Der Button im Detailbereich öffnet:

`/tracking/daily?date=YYYY-MM-DD`

Das Daily Tracking liest diesen Query-Parameter und lädt beziehungsweise
erstellt den Eintrag für genau dieses Datum. Dadurch ist die Timeline nicht nur
eine Auswertung, sondern auch ein Einstiegspunkt zum Bearbeiten oder Erstellen
von Daily Entries.

Der Button-Text hängt vom ausgewählten Tag ab:

- vorhandener Eintrag: `Edit entry`
- kein Eintrag: `New entry`

Für zukünftige Tage bleibt der Button deaktiviert.

## Fehler- und Leerzustände

Während des Ladens zeigt die Seite einen Ladezustand. Wenn der Request
fehlschlägt, wird ein Fehlerbanner mit Retry-Button angezeigt. Der Retry erhöht
`reloadKey`, wodurch der Ladeeffekt erneut ausgeführt wird.

Wenn Highcharts keine Tagesdaten erhält, zeigt `TimelineCalendarChart` einen
neutralen Leerzustand. Für normale Monate sollte dieser Fall praktisch nicht
auftreten, da `buildTimelineDays` für jeden echten Tag des Monats ein Element
erzeugt.

## Was ist selbst gebaut und was ist wiederverwendet?

Selbst gebaut:

- `/timeline` Route und Template.
- Monatsnavigation und Auswahlzustand.
- Laden der Diary-Einträge pro Monat.
- Datumsbereich-API für Diary-Einträge.
- Umwandlung von Diary-Einträgen in Kalendertage.
- Symptom-Score-Berechnung.
- Detail-Zusammenfassung.
- Highcharts-Optionsobjekt für diese konkrete Darstellung.
- Verbindung zur Daily-Tracking-Seite.
- Tests für Utility-Logik, API-Pfade, Middleware und Backend-Range-Abfrage.

Wiederverwendet:

- bestehendes Auth- und Session-Fetching.
- bestehender Diary-Datenfluss und Diary-DTOs.
- bestehende UI-Atoms wie Button, Headline, Icon und Text.
- bestehendes Theme-System.
- Highcharts Heatmap und Highcharts React Wrapper.
- bestehende Daily-Tracking-Seite, erweitert um Datumsvorauswahl per Query.

## Relevante Tests

Die wichtigsten Tests zur Timeline-/Calendar-Funktion liegen hier:

- `frontend/src/components/templates/timeline/__tests__/utils.test.ts`
- `frontend/src/services/diary/__tests__/index.test.ts`
- `frontend/src/app/api/diary/__tests__/_utils.test.ts`
- `frontend/src/__tests__/middleware.test.ts`
- `backend/src/test/java/de/dermatrack/backend/diary/api/controller/DiaryControllerIntegrationTest.java`
- `backend/src/test/java/de/dermatrack/backend/diary/service/DiaryServiceTest.java`

Diese Tests prüfen unter anderem:

- Monatsbereiche.
- Score-Berechnung.
- Heatmap-Koordinaten.
- keine künstlichen Placeholder-Kacheln.
- Query-Parameter für Diary-Range-Requests.
- geschützte `/timeline` Route.
- Backend-Validierung von `fromDate` und `toDate`.
- userbezogene Datumsbereich-Abfrage.
