# Test Plan fuer DermaTrack

Stand: 2026-04-07

Dieses Dokument definiert den aktuellen Testplan fuer DermaTrack auf Basis des verifizierten Repository-Stands.
Es beschreibt:

- welche Bereiche kritisch sind
- was automatisiert getestet wird
- was aktuell nur manuell getestet werden kann
- welche Testarbeiten voneinander abhaengen
- wie Coverage fuer dieses Projekt bewertet werden soll

## 1. Aktueller Projektstand

DermaTrack ist aktuell kein vollstaendig implementiertes Produkt, sondern ein fruehes MVP mit einer klaren Hauptfunktion:

- Backend: `Diary` CRUD ist die wichtigste reale Business-Funktion.
- Frontend: Das Daily-Tracking-Formular und die Next.js-API-Proxies fuer `Diary` existieren.
- Login und Register existieren derzeit nur als UI- und Validierungs-Shells.
- Dashboard, Timeline und Statistik sind noch nicht als vollstaendige Produktfunktionen umgesetzt.

Daraus folgt fuer die Teststrategie:

- Die hoechste Testprioritaet liegt auf `Diary`, Validation, API-Proxying und Security-Verhalten.
- Login/Register werden derzeit vor allem auf UI-Validierung, Navigation und mobile Layouts getestet, nicht auf echte Authentifizierung.
- Prozentuale Coverage ist nur ein Hilfssignal. Wichtiger ist die Abdeckung der wenigen wirklich kritischen Flows.

## 2. Kritische Testbereiche

### Prioritaet P0

Diese Bereiche muessen bei jeder relevanten Aenderung getestet werden:

1. Backend `Diary` CRUD
   - Erstellen, Laden, Aktualisieren, Loeschen
   - Request-Validation
   - Fehlerfaelle wie `404`, ungultige Payloads und interne Fehlerweitergabe

2. Daily-Tracking-Flow im Frontend
   - Formularvalidierung
   - Request an `/api/diary`
   - Fehler- und Erfolgsanzeigen
   - Verhalten bei ungueltigen Bildern, Zukunftsdatum und leeren Daten

3. Frontend API-Proxies fuer `Diary`
   - `frontend/src/app/api/diary/route.ts`
   - `frontend/src/app/api/diary/[id]/route.ts`
   - Weitergabe von Statuscodes und Fehlermeldungen
   - Zod-Validation fuer `POST` und `PUT`

4. Security- und Ownership-relevantes Verhalten im Backend
   - Security-Konfiguration
   - negative Pfade bei nicht erlaubtem oder fehlendem Zugriff
   - spaeter zusaetzlich User-Scoping und Ownership-Regeln

### Prioritaet P1

Diese Bereiche sollen getestet werden, sobald die P0-Abdeckung stabil ist:

1. Login- und Register-UI
   - Feldvalidierung
   - Button-Enabled-State
   - Navigation zwischen `/login` und `/register`
   - Mobile Layout und responsive Darstellung

2. Build-, Lint- und Format-Qualitaet
   - Frontend Build
   - ESLint
   - Prettier
   - TypeScript Type Check in CI

3. Dokumentierte Entwickler-Workflows
   - Pre-commit-Verhalten
   - Root-Skripte fuer Build und Test

### Prioritaet P2

Diese Bereiche sind erst sinnvoll, wenn die Funktionalitaet real existiert:

- Dashboard mit echten Daten
- Timeline
- Statistik
- echte Login- und Registrierungs-API
- End-to-End-Tests fuer authentifizierte Nutzerfluesse

## 3. Testarten und ihr Zweck

### 3.1 Backend Unit- und Model-Tests

Werkzeuge:

- JUnit 5
- Mockito
- AssertJ

Zweck:

- isolierte Business-Logik absichern
- Randfaelle und Validierungslogik schnell pruefen
- Regressionen ohne Spring-Kontext frueh finden

Aktuell vorhandene Beispiele:

- `DiaryServiceTest`
- `DiaryEntryTest`
- `AppUserTest`

### 3.2 Backend Repository- und Integrationstests

Werkzeuge:

- Spring Boot Test
- Spring Security Test
- H2 In-Memory Database
- MockMvc
- JaCoCo

Zweck:

- Controller- und Security-Flows mit echtem Spring-Kontext pruefen
- Persistence-Verhalten gegen H2 absichern
- API-Verhalten und HTTP-Responses verifizieren

Aktuell vorhandene Beispiele:

- `DiaryControllerIntegrationTest`
- `AppUserRepositoryTest`
- `SecurityConfigurationIntegrationTest`

Hinweis:

- H2 ist fuer den aktuellen Stand ausreichend, weil derzeit keine verifizierten PostgreSQL-spezifischen Features genutzt werden.
- Testcontainers werden erst dann notwendig, wenn produktionsrelevantes Verhalten von PostgreSQL-Eigenheiten, DB-Migrationen oder SQL-Spezifika abhaengt.

### 3.3 Frontend automatisierte Tests

Aktueller Stand:

- Es gibt derzeit noch kein aktives Frontend-Test-Framework und kein `test`-Script im `frontend/package.json`.
- Frontend-Qualitaet wird aktuell durch Lint, Format, Build und Type Check in CI abgesichert.

Geplante Zielbereiche fuer automatisierte Frontend-Tests:

1. API-Route-Tests
   - Happy Path fuer `GET`, `POST`, `PUT`, `DELETE`
   - Validation Errors
   - Weitergabe von Backend-Fehlern

2. Validation-Tests
   - `DiaryEntrySchema`
   - `validateRequest` und `validateRequestOrThrow`

3. Component- und Template-Tests
   - Daily-Tracking-Form
   - Login-Template
   - Registration-Template

Bis ein Frontend-Test-Runner eingefuehrt ist, muessen diese Punkte manuell regressionsgetestet werden.

### 3.4 Manuelle Regressionstests

Manuelle Tests bleiben aktuell notwendig fuer:

- Daily Tracking gegen laufendes Backend
- mobile Darstellung von Login/Register
- Navigation und UX-Flows, die noch keine stabile API dahinter haben
- Seiten mit Placeholder-Status

Manuelle Tests sind kein Ersatz fuer Automatisierung, aber derzeit fuer einige Bereiche die einzige verifizierbare Option.

## 4. Verbindliche Testmatrix

| Bereich | Warum kritisch | Automatisierung heute | Manuell heute | Zielbild |
|---|---|---|---|---|
| Backend `Diary` Service/Controller | zentrale Business-Funktion | ja | optional | weiter ausbauen |
| Backend Security | Datenschutz- und Zugriffsrisiko | ja, teilweise | ja | negative Pfade erweitern |
| Frontend `Diary` API-Proxies | Vertrag zwischen UI und Backend | nein | ja | automatisierte Route-Tests |
| Daily-Tracking-Form | wichtigster Nutzerfluss | nein | ja | Component-Tests + Regression |
| Login/Register UI | user-facing, aber noch ohne echte Auth | nein | ja | responsive UI-Tests |
| Frontend Build/Lint/Format | verhindert einfache Regressionen | ja | nein | beibehalten |

## 5. Testabhaengigkeiten

Die wichtigsten Abhaengigkeiten zwischen Testarbeiten sind:

1. Backend-Testbasis vor Frontend-API-Tests
   - Frontend-Tests fuer `Diary` haengen von einem stabilen Backend-Vertrag ab.
   - Deshalb ist `Derma-122` fachlich Vorbedingung fuer `Derma-123`.

2. Frontend-Test-Runner vor echter Frontend-Automatisierung
   - `Derma-202` muss zuerst ein tragfaehiges Frontend-Test-Setup schaffen.
   - Erst danach lassen sich `Diary`-Proxy- und Component-Tests dauerhaft in CI verankern.

3. Reale Authentifizierung vor End-to-End-Auth-Tests
   - Login/Register haben aktuell keine echte Produkt-Auth.
   - Deshalb sind echte End-to-End-Tests fuer Auth noch nicht sinnvoll.

4. Mobile Login/Register-Tests sind weitgehend unabhaengig von Backend-Auth
   - `Derma-143` kann bereits jetzt durch responsive manuelle Tests und spaeter durch UI-Tests abgesichert werden.

## 6. Ticket-Zuordnung innerhalb von DERMA-197

`DERMA-197` ist der uebergeordnete Testplan. Die verknuepften Tickets lassen sich so einordnen:

- `Derma-71`
  - Backend-Tests und lokale Quality Gates
  - Fokus: Backend-Baseline, Pre-Commit, Linter

- `Derma-122`
  - konkrete Backend-Testbasis fuer `Diary`
  - Status im Code: wesentliche Grundlage ist bereits vorhanden

- `Derma-202`
  - Frontend-Testing als eigener Arbeitsstrom
  - Status im Code: noch nicht umgesetzt

- `Derma-123`
  - konkrete Frontend-Tests fuer `Diary` API und Mocking
  - abhaengig von stabiler Backend-Testbasis und Frontend-Test-Setup

- `Derma-143`
  - mobile Absicherung von Login/Register
  - derzeit primaer manueller und spaeter UI-basierter Testscope

## 7. Coverage-Strategie

Coverage wird in diesem Projekt in zwei Schritten bewertet.

### 7.1 Was heute zaehlt

Heute ist wichtiger als ein globaler Prozentwert:

- jeder P0-Flow hat mindestens einen Happy Path
- jeder P0-Flow hat mindestens einen negativen Pfad
- Validation und Fehlerweitergabe sind explizit abgedeckt
- Security-relevante Aenderungen enthalten mindestens einen Zugriffstest

### 7.2 Prozentuale Coverage als Steuerungswert

Aktueller Stand:

- Im Backend wird ein JaCoCo-Report erzeugt.
- Es gibt aktuell keine verifizierte globale Coverage-Schwelle, die den Build blockiert.
- Im Frontend gibt es noch keine automatisierte Coverage-Auswertung.

Empfohlene Zielwerte fuer kuenftige Arbeit:

- Backend Business-Logik in geaenderten kritischen Bereichen: mindestens 80 Prozent Line Coverage als Richtwert
- Frontend API- und Validation-Module nach Einfuehrung eines Test-Runners: mindestens 70 Prozent Line Coverage als Richtwert
- Layout- und Placeholder-Seiten: keine Prozentvorgabe, sondern szenariobasierte Regressionstests

Wichtig:

- Coverage ersetzt keine guten Testfaelle.
- Ein hoher Prozentwert ohne Fehler-, Rand- und Sicherheitsfaelle ist nicht ausreichend.

## 8. Mindestanforderungen pro Change-Type

### 8.1 Backend-Aenderungen an `Diary`

Pflicht:

- bestehende Backend-Tests ausfuehren
- neue oder geaenderte Service-/Controller-Logik mit Tests absichern
- Validation- und Fehlerpfade pruefen

### 8.2 Frontend-Aenderungen am Daily Tracking oder `Diary`-Proxy

Pflicht:

- Frontend linten, format-checken und builden
- manuellen Regressionstest fuer Save/Error/Validation durchfuehren
- nach Einfuehrung eines Frontend-Test-Runners zusaetzlich Route- und Component-Tests ergaenzen

### 8.3 Aenderungen an Login/Register

Pflicht:

- manuelle Validierungspruefung
- responsive Test auf kleiner Breite
- Navigation zwischen Login und Register pruefen

### 8.4 Security- oder Ownership-Aenderungen

Pflicht:

- negative Zugriffstests
- pruefen, ob fremde oder unautorisierte Zugriffe blockiert werden
- keine reine Happy-Path-Absicherung

## 9. Standard-Kommandos

Projektweit:

```powershell
pnpm run test
pnpm run build
```

Frontend:

```powershell
pnpm -C frontend run lint:check
pnpm -C frontend run format:check
pnpm -C frontend build
pnpm -C frontend exec tsc --noEmit
pnpm -C frontend run --if-present test
```

Backend:

```powershell
node scripts/mvnw.js -q test
node scripts/mvnw.js -q clean package -DskipTests
```

Coverage-Report Backend:

```text
backend/target/site/jacoco/index.html
```

## 10. Aktuelle Luecken

Die groessten verifizierten Luecken im Testplan sind derzeit:

1. kein Frontend-Test-Runner
2. keine automatisierten Frontend-Tests fuer `Diary`
3. keine echten End-to-End-Tests fuer authentifizierte Nutzerfluesse
4. mobile UI-Aenderungen an Login/Register sind noch hauptsaechlich manuell abgesichert
5. Coverage-Schwellen sind noch nicht als harte Quality Gates automatisiert

## 11. Zusammenfassung

Der Testplan fuer DermaTrack priorisiert nicht die groesste Anzahl an Tests, sondern die groessten Produktrisiken:

- `Diary` zuerst
- Security und Fehlerpfade frueh
- Frontend-Proxies und Formularvalidierung als naechste Luecke
- Login/Register derzeit als UI- und Mobile-Testthema, nicht als echte Auth-Teststrecke

Solange das Produkt nur wenige echte Kernfunktionen hat, muss die Testabdeckung entlang dieser Kernfunktionen und nicht entlang allgemeiner Prozentwerte gesteuert werden.
