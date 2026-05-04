# DermaTrack

**Team:** Bastian, Philip, Johanna, Sebastian, Sribriddhi

## Tech Stack


## Alles starten:
pnpm dev


## CI / Coverage

This repository contains a `.gitlab-ci.yml` with `backend_test` and `frontend_test` jobs.

- Each job prints a single line `TOTAL COVERAGE: XX.XX%` after tests; GitLab extracts the value using the configured `coverage` regex.
- The helper script used by CI is `scripts/ci/print-coverage.js`.

Local pre-commit warning:

- A non-blocking pre-commit coverage check script is available at `scripts/pre-commit-backend-coverage.js`.
- To enable a git hook that runs this script before commits, you can either install `husky` and add a pre-commit entry, or set your Git hooks path manually. Example using `husky`:

```
npx husky install
npx husky add .husky/pre-commit "node ./scripts/pre-commit-backend-coverage.js"
```

The pre-commit script only emits a warning if backend coverage (JaCoCo) is under 80%.
more commands: build, test, lint, format
--> look at package.json

## Backend starten:
mvnw spring-boot:run

**Profile usage**

    * Use local-h2 for daily local development and quick testing.
    * Use local when testing against a real DB connection. (the DB has to be running)
    * Use prod only for deployed runtime behavior.

## Fronted starten:
pnpm start

