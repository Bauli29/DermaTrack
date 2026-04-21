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

- Single Responsibility Principle
- Information Hiding Principle
- Keep It Simple
- Don’t Repeat Yourself
- Integration Operation Segregation Principle
- Root Cause Analysis

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

### 2.2 Clean Code Principles Applied

- **Don't Repeat Yourself**: validation functions and shared styled components were defined once instead of being duplicated across templates.
- **Single Responsibility Principle**: the shared validation module and shared styles module each have one clear purpose.
- **Keep It Simple**: the `Card` nesting layer in login and registration was removed because it added structure without purpose.
- **Root Cause Analysis**: accessibility issues were fixed in the component itself rather than worked around at usage sites. The CSS variable approach fixes the magic number problem at its source.
- **Code/Naming Conventions**: the `button` folder was renamed to `Button` to match the established PascalCase convention in the atoms layer.

### 2.3 Derma-235 Follow-up

- **Missing slider keyboard support completed** - the shared `Slider` atom now handles `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`, `Home`, and `End` on the focusable thumb, while still respecting disabled state and forwarded event handlers.
- **Slider logic extracted into focused helpers** - value normalization, percentage calculation, pointer-to-value mapping, and key-to-value mapping were moved into `components/atoms/Slider/utils.ts` instead of being kept inline inside the render component.
- **Regression coverage added** - focused Jest tests now verify slider rounding, decimal-step handling, pointer clamping, invalid-range guarding, and supported keyboard controls.
- **Daily tracking template de-duplicated** - the repeated slider rows in `components/templates/daily-tracking/index.tsx` were replaced with small field configuration lists and one shared render path for factor and symptom sliders.
- **Inline presentation logic reduced** - image preview spacing moved from ad-hoc inline `div` styles into template styles, and stale mojibake UI text in the daily tracking flow was normalized.
- **Daily tracking form logic extracted** - date checks, image selection capping, diary payload creation, schema validation, and submission error parsing now live in `components/templates/daily-tracking/utils.ts` instead of being mixed into the template render flow.
- **Daily tracking date handling hardened** - invalid date strings are now treated safely instead of slipping into string-based future-date comparisons.
- **Diary submission service introduced** - the actual `/api/diary` POST request and its response/runtime error normalization now live in `services/diary/index.ts` instead of staying embedded inside the daily tracking template.
- **TextArea semantics aligned with Input** - the `TextArea` molecule now renders a proper clickable `<label htmlFor>` like `Input`, while helper/label spacing uses component props instead of inline style fragments.
- **Showcase/test template cleaned up** - the `/test` template now uses structured showcase arrays and dedicated styled wrappers instead of large inline style objects and repeated link/button markup, and its page title now matches the route purpose.
- **Form field styling centralized** - duplicated validation-border, hover/focus, container, and status-icon styling for `Input` and `TextArea` was extracted into `components/molecules/shared/form-field.ts`.
- **Link icon inheritance normalized** - the `Icon` atom now supports inherited color directly, allowing the `Link` atom to remove the remaining inline style used for its external-link icon.
- **Auth template consistency improved** - login and registration now render errors through the shared `Text` atom, and registration reuses the shared `Link` atom for Terms/Privacy links instead of maintaining a separate anchor style.
- **Auth API/session flow disentangled** - shared helpers now centralize auth cookie names, placeholder session payload creation, invalid-backend-auth handling, and session loading/refresh orchestration instead of scattering these responsibilities across multiple routes and the context provider.
- **Obsolete token-storage removed** - the old localStorage-based token helper and its isolated self-tests were deleted because the current frontend auth flow uses `HttpOnly` cookies and no production code still depended on that module.
- **Diary API proxy routes de-duplicated** - shared helper utilities now centralize cookie-based auth header creation, backend diary path building, backend response forwarding, route-id reading, validated request parsing, and mutation/server error mapping for both `/api/diary` and `/api/diary/[id]`.
- **Diary proxy regression coverage added** - focused tests now verify helper path/header behavior, successful response forwarding, fallback handling for invalid backend JSON, and validation/parsing error mapping.
- **Auth error helpers simplified** - shared auth error code sets, status-code maps, duplicate-error parsing, and user-facing message tables are now defined once in `types/errors.ts` instead of being recreated inline in multiple helper functions.
- **Auth route helpers modularized** - token parsing, session payload creation, auth request schemas, and backend auth error normalization were split out of `app/api/auth/_utils.ts` into focused helper modules instead of living in one catch-all file.
- **Auth helper regression coverage expanded** - focused tests now cover JWT token parsing/expiry handling and backend auth error normalization in the extracted auth helper modules.
- **Auth client flow simplified** - the frontend auth client now reuses a shared route-fetch helper and an extracted session-refresh routine in `context/auth/api.ts` instead of duplicating `fetch` setup and retry behavior across separate functions.
- **Auth client regression coverage added** - focused tests now verify auth request options, 204 handling, structured auth-error parsing, and the session-refresh retry flow in the frontend auth client.
- **Auth form validation snapshots centralized** - login and registration now reuse shared validation-result builders and helper-text mapping from `validation/auth/form-utils.ts` instead of rebuilding the same submit-time validation snapshots and fallback texts inside each template.
- **Auth context state transitions extracted** - loading, session, completion, logout, and auth-error state mapping now live in `context/auth/state-utils.ts`, while login and registration share one action-execution path inside `AuthContext` instead of maintaining parallel request/error orchestration.
- **Auth context regression coverage expanded** - focused tests now verify the extracted auth context state helpers for loading, session mapping, error normalization, and logout state resets.
- **Daily tracking submission preparation centralized** - the template now uses one shared helper to combine form/date/image validation with schema-based payload preparation instead of manually stitching those checks together inside `onSubmit`.
- **Daily tracking dirty-state and image removal extracted** - pending-change detection and image-removal behavior now live in dedicated helpers, so discard handling no longer depends on ad-hoc inline comparisons or repeated array filtering inside the template.
- **Daily tracking redirect lifecycle hardened** - success redirects are now scheduled and cleared through one path, so follow-up edits, image changes, or unmounts do not leave stale delayed navigation behind.
- **Daily tracking regression coverage expanded** - focused tests now cover submission preparation, pending-change detection, image removal, and the shared daily-tracking copy constants.

### 2.4 Additional Clean Code Principles Applied

- **Single Responsibility Principle**: slider math and keyboard mapping are separated from the React rendering and DOM event wiring.
- **Keep It Simple**: mouse, touch, and keyboard interactions now reuse one normalization path instead of each path owning its own rounding rules.
- **Root Cause Analysis**: the missing accessibility behavior was fixed once in the shared atom instead of patched in individual screens such as Daily Tracking.
- **Don't Repeat Yourself**: the daily tracking template no longer repeats the same slider row markup for each field.
- **Information Hiding Principle**: presentational spacing details were moved back behind styled components and component props instead of leaking into template markup.
- **Single Responsibility Principle**: the daily tracking template now focuses more narrowly on UI composition while form validation, payload shaping, and response error parsing sit behind dedicated helpers.
- **Root Cause Analysis**: the date-check path was corrected at the shared helper boundary instead of leaving fragile comparison logic inline in the template.
- **Information Hiding Principle**: the diary submission transport details are now hidden behind a dedicated service instead of leaking `fetch` request setup and response decoding into the template.
- **Keep It Simple**: the internal component showcase now describes repeated examples as data instead of hardcoding every variant in bespoke layout markup.
- **Don't Repeat Yourself**: `Input` and `TextArea` no longer duplicate the same validation and wrapper styling rules.
- **Code Conventions**: auth templates now rely on the same shared atoms for links and error text instead of mixing custom one-off markup into the form flow.
- **Single Responsibility Principle**: auth route helpers, cookie constants, and context session loading each now have a narrower, more explicit responsibility.
- **Don't Repeat Yourself**: auth session/error/cookie response handling is no longer duplicated across login, refresh, session, proxy, and context code paths.
- **Keep It Simple**: removing the unused localStorage token path reduced conceptual overlap between the old and current auth models.
- **Don't Repeat Yourself**: the diary proxy routes no longer duplicate auth-header extraction, backend-path assembly, response forwarding, or request validation/error mapping across collection and detail handlers.
- **Information Hiding Principle**: backend proxy mechanics for diary requests are now hidden behind a dedicated helper instead of leaking transport details into every route function.
- **Don't Repeat Yourself**: the auth error layer now reuses shared code/message sets and parsing helpers instead of rebuilding lookup structures inside every exported helper.
- **Keep It Simple**: auth error parsing now flows through smaller, named helper steps instead of combining mapping, string matching, and fallback rules in one block.
- **Single Responsibility Principle**: auth token parsing, schema definition, session payload creation, and backend error normalization now live in separate helper modules with narrower responsibilities.
- **Information Hiding Principle**: route handlers continue to consume one `_utils` surface while the lower-level token and backend-error mechanics are hidden behind smaller internal modules.
- **Don't Repeat Yourself**: the frontend auth client no longer repeats credentials/include and refresh-retry wiring across request and session-loading helpers.
- **Keep It Simple**: the session-loading flow now describes the retry behavior through one named helper instead of scattering it across multiple fetch functions.
- **Don't Repeat Yourself**: login and registration no longer rebuild the same submit-time validation snapshots or duplicate the same helper-text fallback rules in separate templates.
- **Single Responsibility Principle**: auth form validation snapshots and auth context state transitions now live behind focused helpers instead of being mixed directly into template and provider components.
- **Information Hiding Principle**: the `AuthContext` continues to expose the same public login/register/logout/refetch surface while the internal state-transition details are hidden behind dedicated state helpers.
- **Single Responsibility Principle**: the daily tracking template now focuses more narrowly on UI orchestration while submission preparation, dirty-state checks, and image removal logic sit behind focused helpers.
- **Don't Repeat Yourself**: discard checks, image-removal behavior, and validation-to-payload preparation no longer need separate inline logic inside the template.
- **Root Cause Analysis**: the delayed redirect is now managed at the template boundary, preventing stale navigation after a successful save when the user continues interacting with the form.

### 2.5 Result

The frontend refactoring eliminated duplicated validation, auth-flow, and styling code across the template and client layers, made the `Button`, `Slider`, and `Input` components fully keyboard-accessible and screen-reader compatible, and replaced scattered magic numbers with a single source of truth. The Derma-235 follow-up closed the remaining slider accessibility gap, simplified the diary proxy route layer, tightened the daily tracking form flow and its redirect/dirty-state handling, clarified auth form/context responsibilities, and added regression coverage around the refactored behavior. No functional behavior or visual output was changed outside of the targeted fixes.

## 3. Overall Outcome

The refactoring work improved code clarity, reduced coupling, hardened the API contract, and made the project easier to maintain and extend.
