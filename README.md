# OrangeHRM Playwright Automation Portfolio

Playwright + TypeScript automation project focused on **OrangeHRM** as the primary showcase area, with **UI Testing Playground** kept as a small supporting set of synchronization and geolocation examples.

This repository is meant to present realistic UI automation design choices for a QA portfolio: readable tests, pragmatic page objects, live-demo tradeoffs, and targeted backend-aware validation where it adds value.

## Project Focus

- **Primary showcase: OrangeHRM**
  Login, dashboard, Admin, PIM, Leave, and Claim flows built around page objects and an auth fixture.
- **Secondary coverage: UI Testing Playground**
  Minimal practice specs kept only for deterministic synchronization and browser geolocation coverage.
- **Pragmatic backend awareness**
  OrangeHRM includes selective mocked scenarios where deterministic coverage adds more value than another live-only test.

## What This Repository Demonstrates Today

- Playwright test authoring in TypeScript with a simple, maintainable project layout
- An authenticated fixture in [`src/fixtures/orangehrm/auth.fixture.ts`](src/fixtures/orangehrm/auth.fixture.ts) for reusing OrangeHRM login setup
- Page objects and focused components under [`src/pages/orangehrm`](src/pages/orangehrm), with module-level business actions instead of a central app wrapper
- OrangeHRM live coverage for:
  - login
  - dashboard
  - admin users search, filtering, reset, and mocked-table validation
  - PIM employee search
  - Leave filtering by status/date/employee with reset coverage
  - Claim filtering and negative search coverage
- Locator strategy awareness:
  - role, label, and placeholder locators first
  - scoped DOM fallbacks only where OrangeHRM does not expose a dependable semantic contract
- Selective mocked OrangeHRM scenarios for Admin and Claim that validate:
  - the outgoing request shape
  - controlled filtered or table-rendering behavior
  - deterministic UI outcomes that would otherwise depend on public-demo volatility
- A deliberate split between:
  - **stable supporting practice coverage** suitable for CI
  - **live OrangeHRM showcase coverage** that demonstrates realistic UI automation on a public demo environment

## Scope Notes

This project is intentionally stronger than a basic demo repo, but it does **not** claim to be a full enterprise framework or a complete API automation suite.

What is currently backend-aware:
- request and response helpers for the OrangeHRM admin-users and claim requests endpoints
- mocked response builders
- runtime or request-shape validation around targeted mocked OrangeHRM flows

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
      admin.page.ts
      claim.page.ts
      dashboard.page.ts
      leave.page.ts
      login.page.ts
      pim.page.ts
    playground/
  support/
    orangehrm/
tests/
  ui/
    orangehrm/
    playground/
```

- [`tests/ui/orangehrm`](tests/ui/orangehrm) contains the main portfolio coverage
- [`tests/ui/playground`](tests/ui/playground) contains only the smaller supporting synchronization and geolocation examples
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
- `npm run test:playground` - supporting Playground suite in Chromium
- `npm run test:playground:firefox` - supporting Playground suite in Firefox
- `npm run test:stable` - alias for the smaller stable Playground suite
- `npm run test:all` - full repository suite
- `npm run test:ui` - Playwright UI mode
- `npm run test:report` - open the HTML report

Backward-compatible aliases are also kept for `test:chromium` and `test:firefox`.

## Why This Structure

The OrangeHRM side of the project is intentionally organized around one page object per major module instead of a global manager or facade. That keeps the tests readable, lets each module hide its own UI plumbing, and avoids generic layers that are not earning their keep yet.

Components are only used where the UI structure clearly justifies them, such as Admin filters and tables. The rest of the OrangeHRM module pages stay concrete and business-focused so the suite remains easy to explain and maintain.

## Interview Framing

This repo is meant to show how a growing Playwright suite can stay maintainable without pretending to be a giant framework:

- OrangeHRM is the main portfolio focus, not a single-page demo or an Admin-only exercise
- page objects expose business actions and assertions, while UI plumbing stays inside the page or component
- the auth fixture keeps setup reusable without injecting every page everywhere
- public-demo live coverage is kept realistic, and selective mocked tests are added only where determinism meaningfully improves confidence
- the architecture avoids a central manager or facade because the current suite is clearer with module ownership kept local

## Live Demo Tradeoffs

The OrangeHRM coverage intentionally targets the public demo application because it shows realistic login, navigation, filtering, and data-table handling against a live system.

That comes with normal public-demo tradeoffs:
- data can change between runs
- responsiveness can vary
- some positive-search tests intentionally anchor on records currently visible in the live table so the scenarios remain meaningful without hard-coding volatile demo data
- selective mocked tests are used where the public environment would otherwise make filtered-result validation noisy or non-deterministic
- the environment is useful for portfolio demonstration, but it is not ideal as the only blocking CI gate

For that reason, the GitHub Actions workflow keeps a stable Playground suite as the deterministic CI signal while OrangeHRM remains the main showcase area of the repository.
