# Scalable Capital Test Suite

Playwright automation for product pages, registration and onboarding flows, API
response schemas, and production login-screen detection.

## End-to-end integration prerequisite

To validate the complete customer journey - from onboarding through account
activation - an authorized, stable, compliant test environment is required. It
must allow the team to create synthetic customer data, exercise and verify the
integration flow, and delete the test data afterward. The current onboarding
UI tests stub API writes locally, so they do not claim to verify a live
end-to-end activation flow. Production checks are read-only login-state checks
and are not a substitute for this environment.

## Contents

- [End-to-end integration prerequisite](#end-to-end-integration-prerequisite)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Running tests](#running-tests)
- [Test coverage](#test-coverage)
- [Reports and artifacts](#reports-and-artifacts)
- [Safety notes](#safety-notes)

## Project structure

```text
src/
  api/                 Shared API request helper
  config/              Local environment files (not committed)
  constants/           Production URLs, selectors, and login states
  fixtures/            Shared API and page fixtures
  pages/               Page objects and login-state helpers
  tests/
    api/               API response and profile-schema tests
    scalable-products.spec.ts
                       Product, registration, and mocked onboarding tests
    production-2fa-link.spec.ts
                       Checks against the live production site
    production-login-state.test.ts
                       Offline login-state detection test

playwright.config.ts   Playwright projects and reporters
reports/              Generated HTML report output
allure-results/       Generated Allure results
test-results/         Test-run artifacts
```

## Requirements

- Node.js and npm
- Chromium and Firefox, installed through Playwright
- Authorized credentials and API configuration for tests that access protected
  endpoints

## Getting started

Install dependencies and the supported browsers from the project root:

```powershell
npm ci
npx playwright install chromium firefox
```

## Configuration

Playwright loads `src/config/.env.<ENV>.local`. The `ENV` variable defaults to
`production`, selecting `src/config/.env.production.local` by default. Set
`ENV` to select a different local environment file.

Depending on the tests you run, configure these variables in your process
environment or appropriate local environment file:

| Variable | Purpose |
| --- | --- |
| `ENV` | Selects the local environment file; defaults to `production`. |
| `BASE_URL` | Base URL used by the Playwright page fixtures. |
| `API_BASE_URL` | Overrides the API helper's default base URL. |
| `API_TOKEN` | API authorization token used by API schema tests. |
| `SCALABLE_USERNAME` | Production login credential; required by the production suite. |
| `SCALABLE_PASSWORD` | Production login credential; required by the production suite. |

Keep local environment files and credentials out of version control. Do not
paste real customer or financial information into tests or documentation.

## Running tests

Run the full Playwright suite in both configured browsers:

```powershell
npm test
```

Run only the Chromium project:

```powershell
npm run test:chrome
```

Run individual Playwright test files (both configured browsers by default):

```powershell
npx playwright test scalable-products.spec.ts
npx playwright test production-2fa-link.spec.ts
npx playwright test users.api.schema.spec.ts
npx playwright test scalable.auth.spec.ts
```

For a single browser, add `--project=chromium` or `--project=firefox`:

```powershell
npx playwright test scalable-products.spec.ts --project=chromium
```

Run a specific scenario by name, or list matching tests without running them:

```powershell
npx playwright test scalable-products.spec.ts --grep "simulated onboarding"
npx playwright test scalable-products.spec.ts --list
```

Run only the local profile-schema validation:

```powershell
npx playwright test users.api.schema.spec.ts --grep "user profile schema requires all profile fields"
```

The login-state unit test uses Node's test runner:

```powershell
node --import tsx --test src\tests\production-login-state.test.ts
```

### Production login and 2FA checks

The production suite runs by default and uses a headed Chromium browser. It
checks the public site and login page, validates recognized login/2FA screen
states and secure origins, and includes a 30-second window for manual
interaction. The suite requires `SCALABLE_USERNAME` and `SCALABLE_PASSWORD` to
be configured; it does not submit those credentials.

Run it only when you are authorized to access the production site. To run just
this suite:

```powershell
npx playwright test production-2fa-link.spec.ts
```

For a Chromium-only run:

```powershell
npx playwright test production-2fa-link.spec.ts --project=chromium
```

## Test coverage

- **Product and onboarding UI:** product pages, registration form validation,
  synthetic negative cases, and onboarding flows with API writes stubbed
  locally.
- **API response schemas:** single-user, user-list, and create-user responses.
- **Profile schema:** requires personal details, address, mobile phone number,
  financial profile, tax country, and bank IBAN; rejects missing required
  fields.
- **Production login checks:** public-site navigation, login popup, secure
  origins, and login/2FA screen-state detection.
- **Offline login-state test:** recognizes login, setup, linking, and unknown
  screens without network access.

## Reports and artifacts

Playwright is configured to create:

- HTML reports under `reports/html-report/`
- Allure results under `allure-results/`
- Test artifacts under `test-results/`

After running the tests, open the HTML report in your browser with:

```powershell
npx playwright show-report reports/html-report
```

This serves the report locally and opens its `index.html`.

Screenshots are captured on failure, videos are retained on failure, and traces
are recorded on the first retry.

## Safety notes

- Product and onboarding tests use synthetic data; the demo onboarding flow
  stubs API writes locally.
- API tests may create synthetic users on the configured API. Use an authorized
  test environment and valid test credentials.
- Production checks reach the live site. Run them only with explicit
  authorization, and keep production credentials private.
