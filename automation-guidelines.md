# Automation Guidelines (Playwright + OrangeHRM)

This repository is designed as a realistic QA automation portfolio project, not as a framework experiment or a collection of demo tests.

The goal is to demonstrate maintainable, business-oriented Playwright automation aligned with real-world practices.

---

## Core Principles

- Focus on **realistic test scenarios**, not artificial coverage
- Prefer **clarity over abstraction**
- Avoid unnecessary framework complexity
- Treat automation as part of **product quality**, not just UI interaction

---

## Architecture Rules

- No global "manager" or facade for the entire application
- Page objects are **feature-based and modular**
- Components are used only where UI structure justifies them
- No abstraction without a real need (duplication or complexity)

---

## Test Design

- Tests should express **business intent**, not UI steps
- Prefer fewer, stronger scenarios over many shallow ones
- Always include negative or edge-case coverage where meaningful
- Avoid test inflation for portfolio purposes

---

## Locator Strategy

Preferred order depends on the context:

In real-world applications:
1. data-testid (when available and stable)

In UI-focused or portfolio scenarios:
1. getByRole
2. getByLabel
3. getByPlaceholder
4. Visible text
5. Scoped locators
6. data-testid
7. CSS / ID (last resort)

Selectors should be:
- readable
- stable
- defensible in code review

---

## Stability & Synchronization

- Rely on Playwright auto-waiting and assertions
- Avoid arbitrary timeouts and sleeps
- Prefer waiting for meaningful UI states (URL, visible elements, stable containers)

---

## Mocking & Network Control

- Use mocks selectively, not everywhere
- Apply mocking where:
  - determinism is required
  - live environment is unstable
  - edge cases are hard to reproduce
- Keep mock logic clean and separate from test assertions

---

## Scope of the Project

- OrangeHRM is the **main showcase**
- Playground is **minimal and supporting only**
- Multi-module coverage is preferred over deep single-module focus

---

## Goal

Keep the project:
- maintainable
- realistic
- interview-defensible
- representative of a growing automation suite