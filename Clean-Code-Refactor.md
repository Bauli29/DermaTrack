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
- **Meaningful Names**: the `button` folder was renamed to `Button` to match the established PascalCase convention in the atoms layer.

### 2.5 Result

The frontend refactoring eliminated all duplicated validation and styling code across the template layer, made the `Button`, `Slider`, and `Input` components fully keyboard-accessible and screen-reader compatible, and replaced scattered magic numbers with a single source of truth. No functional behavior or visual output was changed outside of the targeted fixes.

## 3. Overall Outcome

The refactoring work improved code clarity, reduced coupling, hardened the API contract, and made the project easier to maintain and extend.
