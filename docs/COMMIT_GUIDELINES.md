# Commit Guidelines

## Goal

Keep commit history readable, reviewable, and automation-friendly.

## Recommended Commit Format

Use Conventional Commit style:

`<type>(<scope>): <short summary>`

Examples:

- `feat(frontend): add symptom trend chart component`
- `fix(backend): handle null nutrition values in statistics mapper`
- `ci(workflows): split backend pipeline into build and test jobs`
- `docs(visualization): add chart JSON examples`

## Allowed Types

- `feat`: new functionality
- `fix`: bug fix
- `refactor`: code change without behavior change
- `test`: tests added or changed
- `docs`: documentation only
- `ci`: workflow or pipeline changes
- `chore`: maintenance tasks

## Scope Rules

Use clear scopes that match this repository:

- `frontend`
- `backend`
- `workflows`
- `docs`
- `infra`

## Message Quality Rules

- Keep summary in present tense.
- Keep summary under 72 characters when possible.
- Start with a verb: add, fix, update, remove, refactor.

## Optional Push Trigger

- Use `[push]` in the commit message only when you intentionally want to trigger the optional push/deploy stage on main.
- Do not use `[push]` in normal feature commits.
- Optional push/deploy can also be triggered manually via workflow dispatch.

## Commit Size Rules

- Prefer small commits with one clear purpose.
- Separate unrelated frontend and backend changes into different commits.
- Separate refactoring from functional changes when possible.
- Include tests in the same commit as behavior changes.
