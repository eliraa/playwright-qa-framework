# OrangeHRM Playwright Automation Portfolio

Playwright + TypeScript automation project focused on **OrangeHRM** as the primary showcase area, with **UI Testing Playground** retained as secondary practice coverage.

This repository is meant to present realistic UI automation design choices for a QA portfolio: readable tests, pragmatic page objects, live-demo tradeoffs, and targeted backend-aware validation where it adds value.

## Project Focus

- **Primary showcase: OrangeHRM**
  Login, dashboard, and admin-users flows built around page objects and an auth fixture.
- **Secondary coverage: UI Testing Playground**
  Smaller practice specs used for deterministic synchronization, locator, and interaction exercises.
- **Pragmatic backend awareness**
  The OrangeHRM admin-users area includes request matching, mocked responses, and runtime response contract checks under [`src/support/orangehrm`](src/support/orangehrm).

## What This Repository Demonstrates Today

- Playwright test authoring in TypeScript with a simple, maintainable project layout
- An authenticated fixture in [`src/fixtures/orangehrm/auth.fixture.ts`](src/fixtures/orangehrm/auth.fixture.ts) for reusing OrangeHRM login setup
- Page objects and focused components under [`src/pages/orangehrm`](src/pages/orangehrm) and [`src/pages/playground`](src/pages/playground)
- OrangeHRM live coverage for:
  - login
  - dashboard
  - admin users search and filtering
- A mocked OrangeHRM admin-users test that validates:
  - the outgoing request shape
  - the mocked response contract at runtime
  - the rendered UI table output
- A clear separation between:
  - **stable practice coverage** suitable for CI
  - **live demo coverage** that is valuable for portfolio signal but depends on an external public environment

## Scope Notes

This project is intentionally stronger than a basic demo repo, but it does **not** claim to be a full enterprise framework or a complete API automation suite.

What is currently backend-aware:
- request and response helpers for the OrangeHRM admin-users endpoint
- mocked response builders
- runtime contract assertions for the mocked admin-users response

What is not claimed here:
- full service-level API test coverage
- deep contract testing across the whole application
- a large custom framework layered on top of Playwright

## Project Layout

```text
src/
  config/
  data/
  fixtures/
  pages/
    orangehrm/
    playground/
  support/
    orangehrm/
tests/
  ui/
    orangehrm/
    playground/
```

- [`tests/ui/orangehrm`](tests/ui/orangehrm) contains the main portfolio coverage
- [`tests/ui/playground`](tests/ui/playground) contains secondary practice scenarios
- [`src/support/orangehrm`](src/support/orangehrm) contains backend-aware helpers for the mocked admin-users workflow

## Setup

```bash
npm install
npx playwright install
```

Optional environment overrides:
- `PLAYGROUND_BASE_URL`
- `ORANGEHRM_BASE_URL`
- `LOCAL_BASE_URL`

If no overrides are provided, the project uses the public UI Testing Playground and OrangeHRM demo URLs defined in [`src/config/testEnvironment.ts`](src/config/testEnvironment.ts).

## Run The Suites

```bash
npm test
```

Runs the primary OrangeHRM showcase suite.

Other useful commands:

- `npm run test:orangehrm` - OrangeHRM live showcase suite
- `npm run test:orangehrm:headed` - OrangeHRM suite in headed mode
- `npm run test:playground` - stable Playground practice suite in Chromium
- `npm run test:playground:firefox` - Playground practice suite in Firefox
- `npm run test:stable` - alias for the stable Playground suite
- `npm run test:all` - full repository suite
- `npm run test:ui` - Playwright UI mode
- `npm run test:report` - open the HTML report

Backward-compatible aliases are also kept for `test:chromium` and `test:firefox`.

## Live Demo Tradeoffs

The OrangeHRM coverage intentionally targets the public demo application because it shows realistic login, navigation, filtering, and data-table handling against a live system.

That comes with normal public-demo tradeoffs:
- data can change between runs
- responsiveness can vary
- the environment is useful for portfolio demonstration, but it is not ideal as the only blocking CI gate

For that reason, the GitHub Actions workflow keeps a stable Playground suite as the deterministic CI signal while OrangeHRM remains the main showcase area of the repository.
