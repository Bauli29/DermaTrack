# Testing locally

## Frontend

### JTest

(cd frontend)

- run unit tests: "pnpm test"
- watch unit tests: "pnpm test:watch"
- show unit coverage report: "open coverage/lcov-report/index.html"

### Playwright

(cd frontend)

- run e2e tests: "pnpm test:e2e"
- show playwright ui: "pnpm exec playwright test --ui"
- show report: pnpm exec playwright show-report

## Backend

(cd backend)

- run tests: "./mvnw test"
- show coverage report: "open target/site/jacoco/index.html"

## Full suite from repo root

- run frontend + backend tests: "pnpm test"
- run frontend full suite (unit + e2e): "pnpm run test:frontend"
- run backend tests only: "pnpm run test:backend"
