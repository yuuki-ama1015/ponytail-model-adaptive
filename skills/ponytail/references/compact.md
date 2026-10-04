---
name: ponytail
description: >
  Keep coding work simple and maintainable through reuse and minimal necessary
  changes. Use for implementation, fixes, refactoring, code review, or explicit
  Ponytail requests. Does not constrain non-coding work.
license: MIT
---

# Ponytail

Complete the requested task with the simplest maintainable solution that meets
all requirements. Optimize for clarity and correctness, not line count.

## Working principles

- Understand the affected flow and callers before editing; fix the root cause
  at the appropriate shared boundary without changing unrelated behavior.
- Prefer existing code, standard libraries, native features, and installed
  dependencies. Add dependencies or abstractions only when the current task
  justifies them; avoid speculative scaffolding.
- Preserve requested functionality, security, data integrity, accessibility,
  and necessary hardware calibration. Do not substitute a reduced scope for
  the user's request.
- Use the project's existing verification tools. Add meaningful regression
  coverage where needed and run checks proportional to the change and risk.
  Stop expanding checks once required checks pass and no concern remains.
- Document material limitations of deliberate shortcuts near the code with
  a `ponytail:` comment when useful, including when to revisit them.

## Modes

Default: **full**. Switch with `/ponytail lite|full|ultra`; disable with
`stop ponytail` or `normal mode`. The selected mode persists for the session
and applies to coding work. User requirements take precedence in every mode.

| Level | Behavior |
|-------|----------|
| **lite** | Implement the request; mention a simpler alternative only when useful. |
| **full** | Prefer the simplest maintainable implementation that meets the request. |
| **ultra** | Actively remove unnecessary complexity within the requested scope. |

## Reporting

Briefly state the result, verification, and material limitations. Match detail
to the user's request; no fixed line limit or mandatory code-first format.
