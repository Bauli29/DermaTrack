# DermaTrack

**Team:** Bastian, Philip, Johanna, Sebastian, Sribriddhi

## Tech Stack

- Frontend: Next.js 15 (React 19, TypeScript), styled-components (SSR)
- Backend: Java 21 / Spring Boot 3.5 (Web, JPA, Security, Actuator)
- Datenbank: PostgreSQL

---

## Quickstart (lokal)

Voraussetzungen:
- Java 21, Node.js 20+ (oder 18 LTS), Git
- Optional: Docker (für spätere Deployments), Postgres lokal nicht zwingend nötig (Neon wird genutzt)

### 1) Backend starten
- `.env` liegt bereits in `backend/.env` und enthält deine Neon-Verbindungsdaten:
  ```env
  DATABASE_URL=postgresql://... (Neon URL)
  PORT=8080
  ```
- Starten:
  ```powershell
  cd backend
  .\mvnw.cmd spring-boot:run
  ```
- Healthcheck prüfen: http://localhost:8080/actuator/health (Status: `UP`)

### 2) Frontend starten
```powershell
cd frontend
pnpm install
pnpm dev
```
- Öffne http://localhost:3000
- Die Startseite zeigt jetzt zusätzlich den Backend-Health-Status (über eine Proxy-Route)

---

## Konfiguration

### Backend
- `.env` (bereits angelegt) wird beim Start automatisch geladen:
  - `DATABASE_URL` (postgresql://… → wird intern nach JDBC konvertiert)
  - `PORT` (Standard 8080)

### Frontend
- Server-seitige Proxy-Route: `src/app/api/backend-health/route.ts`
  - Greift auf `${process.env.BACKEND_URL || 'http://localhost:8080'}/actuator/health` zu
- Beispiel-Datei: `frontend/.env.local.example`
  ```env
  BACKEND_URL=http://localhost:8080
  ```
  Lege optional eine `frontend/.env.local` an, wenn der Backend-Port/Host abweicht.

---

## Neu hinzugefügt in dieser Iteration
- `backend/.env` mit deiner Neon-Datenbank-URL (Git-ignoriert)
- Next.js API-Proxy: `frontend/src/app/api/backend-health/route.ts`
- Beispiel-Env für Frontend: `frontend/.env.local.example`
- UI: Health-Anzeige in `TempThemeTest`

---

## Hinweis zu Turbopack und Lockfiles
Wenn Next.js (Turbopack) meldet, dass mehrere Lockfiles gefunden wurden, bedeutet das, dass innerhalb des Projekts (oder darüber) z. B. sowohl ein `package-lock.json` (npm) als auch ein `pnpm-lock.yaml` (PNPM) existiert. Das führt zu Warnungen und potenziell inkonsistenten Auflösungen.

Empfohlene Lösungen (bitte eine Variante wählen):
1. Bei npm bleiben (einfach):
   - `frontend/package-lock.json` behalten
   - `frontend/pnpm-lock.yaml` entfernen
2. Auf PNPM umstellen (performant, beliebt für Monorepos):
   - `frontend/pnpm-lock.yaml` behalten
   - `frontend/package-lock.json` entfernen
   - Optional: `packageManager`-Feld setzen und (später) `pnpm-workspace.yaml` hinzufügen

Ich richte gern die gewählte Variante ein und bereinige die Lockfiles entsprechend.
