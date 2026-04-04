# Logging Guidelines

## Log Levels

- `TRACE`: Very detailed flow information for deep debugging. Use sparingly and only for temporary investigations or very chatty internal details.
- `DEBUG`: Detailed technical information that helps during development, but is not needed in normal operation.
- `INFO`: Important lifecycle and business events that should normally be visible in the logs.
- `WARN`: Recoverable problems, unexpected situations, or input issues that the application can handle.
- `ERROR`: Unhandled failures or situations where the current operation could not be completed.

## Goals

- Keep the logs readable in normal development and test runs.
- Make important events visible without scrolling through repeated request noise.
- Log in a way that helps debugging, root-cause analysis, and operational monitoring.

## Best Practices

- Use `INFO` for rare, meaningful events such as startup milestones, mock-data generation, or other one-time lifecycle actions.
- Use `DEBUG` for implementation details that are useful while developing, but do not belong in everyday output.
- Use `TRACE` for method-entry or method-exit messages, especially in controllers and services that are called often.
- Use `WARN` for validation problems, malformed input, missing resources, access problems, and other handled exceptions.
- Use `ERROR` only when the request or operation fails unexpectedly and the application cannot handle it cleanly.
- Keep log messages short, direct, and factual.
- Prefer message templates with parameters instead of string concatenation.
- Include the relevant business identifier in the message when it matters, such as an id, username, or path.
- Do not log sensitive data like passwords, tokens, or full request bodies.
- Avoid logging the same event at multiple layers. Log once where the issue becomes meaningful.
- Do not use logs as a substitute for return values, validation, or exception handling.

## Recommended Pattern

- `TRACE`: controller/service request flow, internal step-by-step details
- `DEBUG`: technical decisions, conditional branches, repository interactions during troubleshooting
- `INFO`: startup, shutdown, seed data, admin actions, major state changes
- `WARN`: validation, invalid user input, recoverable resource issues
- `ERROR`: unexpected exceptions, failed persistence, unhandled failures

## Project Rules

- Controllers should stay quiet by default. Use `TRACE` only if you need to trace request flow.
- Services should log only meaningful business actions or exceptional conditions.
- Exception handlers should convert errors into structured responses and log with the matching severity.
- Configuration and bootstrap code should log only important lifecycle steps.
- If a log appears on every request, it should usually be `TRACE`, not `DEBUG` or `INFO`.

## Example

```java
log.trace("DiaryController: create diary entry request received");
log.info("Generating mock data for H2 database");
log.warn("Validation failed: {}", ex.getMessage());
log.error("Unhandled exception while saving diary entry", ex);
```
