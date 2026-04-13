# DermaTrack

**Team:** Bastian, Philip, Johanna, Sebastian, Sribriddhi

## Tech Stack

- Frontend: React / Next.js (TypeScript)
- Backend: Java / Spring Boot
- Datenbank: PostgreSQL

## Alles starten:
pnpm dev

more commands: build, test, lint, format
--> look at package.json

## Backend starten:
set SPRING_PROFILES_ACTIVE=local-h2
mvnw spring-boot:run

**Profile usage**

    * Use local-h2 for daily local development and quick testing.
    * Use local when testing against a real DB connection. (the DB has to be running)
    * Use prod only for deployed runtime behavior.

## Fronted starten:
pnpm start

