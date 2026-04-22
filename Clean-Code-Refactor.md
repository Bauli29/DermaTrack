# Refactoring Summary Based on Clean Code Principles

## Purpose of this Document

This document is structured so that multiple team members can add their own refactoring contributions over time. Each section describes one refactoring area and can be extended independently.

---

## 1. Backend Refactoring

### 1.1 What Was Changed

- **Profile setup simplified** — three profiles: `local-h2` (H2 + mock data), `local` (real database), `prod` (production). The old `dev` profile was removed.
- **Configuration overlap reduced** — shared defaults in base config, environment-specific values in profile files.
- **Production auth aligned with business logic** — authentication uses persisted database users instead of in-memory users, preventing mismatches. Bootstrap logic seeds an auth user at startup if needed.
- **API contracts separated from persistence models** — dedicated request/response DTOs with mapper logic replace direct JPA entity usage at the API boundary.
- **DTO validation added** — all request DTOs carry Jakarta Validation annotations (`@NotBlank`, `@Size`, `@Pattern`, `@Email`, `@Min`, `@Max`) enforced via `@Valid` at the controller interface level. Invalid input is rejected at the boundary with structured 400 responses.
- **Auth responses use proper HTTP status codes and DTOs** — every endpoint returns a typed `ResponseEntity` (register → 201, login/refresh → 200, logout → 204) instead of informal strings.
- **Custom auth exceptions and global exception handling** — `UsernameAlreadyExistsException`, `EmailAlreadyExistsException` (409), `InvalidCredentialsException`, `InvalidRefreshTokenException` (401) replace generic throws. A `GlobalExceptionHandler` (`@RestControllerAdvice`) maps all exceptions to a consistent `ErrorResponse` DTO.
- **Security configuration streamlined** — simplified into a single filter chain bean with clearly grouped concerns: public endpoints, profile-aware H2 console access, JWT filter placement, security headers, and stateless session management.
- **Packages moved to correct bounded context level** — `model`, `repository`, and `service` moved out of the `api` subfolder so only web-layer concerns (controllers, DTOs, mappers) remain inside `api/`.
- **Auth test coverage expanded** — systematic happy/unhappy path testing across integration (11 tests), service (12 tests), JWT (12 tests), and filter (6 tests) layers.

### 1.2 Clean Code Principles Applied

- **Single Responsibility Principle**: controller/API concerns stay in `api/`, while domain data (`model`), persistence (`repository`), and business logic (`service`) were moved to their bounded layers.
- **Information Hiding Principle**: JPA entities are no longer exposed directly at the API boundary; dedicated request/response DTOs and mappers hide persistence internals.
- **Keep It Simple**: security setup was simplified into one filter chain with grouped concerns (public endpoints, H2 profile exception, JWT filter placement, headers, stateless sessions).
- **Don’t Repeat Yourself**: shared defaults were centralized in base config and profile-specific values isolated in profile files to reduce repeated/overlapping configuration.
- **Integration Operation Segregation Principle**: auth endpoints now expose clear operation-specific contracts (`register`, `login`, `refresh`, `logout`) with typed `ResponseEntity` responses and operation-appropriate HTTP status codes.
- **Root Cause Analysis**: auth error behavior was corrected at the source by introducing domain-specific exceptions plus `GlobalExceptionHandler` mapping (409/401), instead of handling failures with generic runtime errors.

## 2. Frontend Refactoring

### 2.1 What Was Changed

- **Shared validation module** — `validateEmail`, `validatePassword`, `validateConfirmPassword` extracted from duplicated template code into `validation/auth/index.ts`.
- **Shared styled components** — `PageWrapper`, `Label`, `SignInPrompt` defined once in `components/templates/shared/styles.ts`. The unnecessary `Card` wrapper was removed.
- **Button accessibility** — fixed WCAG AA contrast (text color to `#ffffff`), replaced `pointer-events: none` with `cursor: not-allowed` + `opacity: 0.6`, added `&:focus-visible` outline, narrowed `:hover` to exclude disabled state. Folder renamed `button` to `Button` (PascalCase convention).
- **Slider accessibility** — added `aria-label` with fallback, keyboard support (arrow keys, Home, End) via `handleKeyDown`. All six slider instances received descriptive labels.
- **Input label semantics** — `<p>` replaced with `<label htmlFor>` linked to `useId()`-generated id.
- **File input accessibility** — native input visually hidden via CSS clip pattern, `&:focus-within` outline added, list key changed to composite of `file.name` + `file.size` + index.
- **CSS variables for layout heights** — magic number `64` replaced with `--header-height` and `--navbar-height` custom properties in `global-style.ts`.
- **App metadata** — added `<title>`, `<meta name="description">`, and viewport config to `layout.tsx`.
- **Slider logic extracted into focused helpers** — value normalization, percentage calculation, pointer-to-value mapping, and key-to-value mapping were moved into `components/atoms/Slider/utils.ts` instead of being kept inline inside the render component.
- **Daily tracking template de-duplicated** — the repeated slider rows in `components/templates/daily-tracking/index.tsx` were replaced with small field configuration lists and one shared render path for factor and symptom sliders.
- **Inline presentation logic reduced** — image preview spacing moved from ad-hoc inline `div` styles into template styles, and stale mojibake UI text in the daily tracking flow was normalized.
- **Daily tracking form logic extracted** — date checks, image selection capping, diary payload creation, schema validation, and submission error parsing now live in `components/templates/daily-tracking/utils.ts` instead of being mixed into the template render flow.
- **Daily tracking date handling hardened** — invalid date strings are now treated safely instead of slipping into string-based future-date comparisons.
- **Diary submission service introduced** — the actual `/api/diary` POST request and its response/runtime error normalization now live in `services/diary/index.ts` instead of staying embedded inside the daily tracking template.
- **TextArea semantics aligned with Input** — the `TextArea` molecule now renders a proper clickable `<label htmlFor>` like `Input`, while helper/label spacing uses component props instead of inline style fragments.
- **Showcase/test template cleaned up** — the `/test` template now uses structured showcase arrays and dedicated styled wrappers instead of large inline style objects and repeated link/button markup, and its page title now matches the route purpose.
- **Form field styling centralized** — duplicated validation-border, hover/focus, container, and status-icon styling for `Input` and `TextArea` was extracted into `components/molecules/shared/form-field.ts`.
- **Link icon inheritance normalized** — the `Icon` atom now supports inherited color directly, allowing the `Link` atom to remove the remaining inline style used for its external-link icon.
- **Auth template consistency improved** — login and registration now render errors through the shared `Text` atom, and registration reuses the shared `Link` atom for Terms/Privacy links instead of maintaining a separate anchor style.
- **Auth API/session flow disentangled** — shared helpers now centralize auth cookie names, placeholder session payload creation, invalid-backend-auth handling, and session loading/refresh orchestration instead of scattering these responsibilities across multiple routes and the context provider.
- **Obsolete token-storage removed** — the old localStorage-based token helper and its isolated self-tests were deleted because the current frontend auth flow uses `HttpOnly` cookies and no production code still depended on that module.
- **Diary API proxy routes de-duplicated** — shared helper utilities now centralize cookie-based auth header creation, backend diary path building, backend response forwarding, route-id reading, validated request parsing, and mutation/server error mapping for both `/api/diary` and `/api/diary/[id]`.
- **Auth error helpers simplified** — shared auth error code sets, status-code maps, duplicate-error parsing, and user-facing message tables are now defined once in `types/errors.ts` instead of being recreated inline in multiple helper functions.
- **Auth route helpers modularized** — token parsing, session payload creation, auth request schemas, and backend auth error normalization were split out of `app/api/auth/_utils.ts` into focused helper modules instead of living in one catch-all file.
- **Auth client flow simplified** — the frontend auth client now reuses a shared route-fetch helper and an extracted session-refresh routine in `context/auth/api.ts` instead of duplicating `fetch` setup and retry behavior across separate functions.
- **Auth form validation snapshots centralized** — login and registration now reuse shared validation-result builders and helper-text mapping from `validation/auth/form-utils.ts` instead of rebuilding the same submit-time validation snapshots and fallback texts inside each template.
- **Auth context state transitions extracted** — loading, session, completion, logout, and auth-error state mapping now live in `context/auth/state-utils.ts`, while login and registration share one action-execution path inside `AuthContext` instead of maintaining parallel request/error orchestration.
- **Daily tracking submission preparation centralized** — the template now uses one shared helper to combine form/date/image validation with schema-based payload preparation instead of manually stitching those checks together inside `onSubmit`.
- **Daily tracking dirty-state and image removal extracted** — pending-change detection and image-removal behavior now live in dedicated helpers, so discard handling no longer depends on ad-hoc inline comparisons or repeated array filtering inside the template.
- **Daily tracking redirect lifecycle hardened** — success redirects are now scheduled and cleared through one path, so follow-up edits, image changes, or unmounts do not leave stale delayed navigation behind.
- **Regression coverage expanded** — focused tests now verify slider rounding, decimal-step handling, pointer clamping, invalid-range guarding, keyboard controls, diary proxy helper behavior, auth helper modules, auth client/session flows, auth context state helpers, and daily tracking helper logic.

### 2.2 Clean Code Principles Applied

- **Don’t Repeat Yourself**: duplicated logic in auth forms, diary proxy routes, and daily tracking templates was reduced through shared helpers (`validation/auth/form-utils.ts`, diary proxy helpers, daily-tracking utilities) and configuration-driven rendering.
- **Single Responsibility Principle**: validation, token/session parsing, context state transitions, API transport, and UI composition were separated into focused modules (for example `components/atoms/Slider/utils.ts`, `context/auth/state-utils.ts`, `services/diary/index.ts`).
- **Information Hiding Principle**: low-level backend transport, token/cookie handling, and error normalization were hidden behind helper/service boundaries, including modularized auth route helpers split out of `app/api/auth/_utils.ts`.
- **Keep It Simple**: deeply nested or inline-heavy template logic was replaced with reusable utilities and standardized component patterns, including slider field configuration lists and extracted daily-tracking submission preparation.
- **Root Cause Analysis**: fixes targeted shared roots rather than one-off patches, for example slider keyboard support at the atom level, centralized auth session orchestration, safe date handling for invalid values, and managed redirect lifecycle cleanup.
- **Code/Naming Conventions**: component naming and atom usage were aligned with project conventions (`button` -> `Button`, shared Text/Link usage in auth templates), reducing UI-layer inconsistency.

### 2.3 Result

The frontend refactoring now presents one cohesive evolution: shared validation and styling, stronger accessibility semantics, cleaner auth/session architecture, consolidated diary proxy logic, and hardened daily tracking flows. The former Derma-235 follow-up items are fully integrated into this baseline rather than treated as a separate add-on. Overall, maintainability and testability improved significantly while preserving intended user-facing behavior.

## 3. Overall Outcome

The refactoring work improved code clarity, reduced coupling, hardened the API contract, and made the project easier to maintain and extend.
