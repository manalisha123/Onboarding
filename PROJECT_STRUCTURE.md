# Project Structure

This document describes the current layout of the Playwright test project.
Test support code and suites live under `src/`; Playwright configuration,
project documentation, and generated reports live at the repository root.

## Repository layout

```text
.
├── src/
│   ├── api/
│   │   └── ApiHelper.ts
│   ├── config/
│   │   └── .env.<ENV>.local                 Local settings; keep private
│   ├── constants/
│   │   ├── index.ts
│   │   ├── production.ts
│   │   └── states.ts
│   ├── fixtures/
│   │   ├── apiFixtures.ts
│   │   └── pageFixtures.ts
│   ├── pages/
│   │   ├── AgenticPage.ts
│   │   ├── CreditPage.ts
│   │   ├── InterestPage.ts
│   │   ├── InvestPage.ts
│   │   ├── ProductionLoginState.ts
│   │   ├── RegistrationDialog.ts
│   │   ├── RetirementPage.ts
│   │   ├── ScalableHomePage.ts
│   │   ├── ScalableProductPage.ts
│   │   └── index.ts
│   └── tests/
│       ├── api/
│       │   ├── scalable.auth.spec.ts
│       │   └── users.api.schema.spec.ts
│       ├── production-2fa-link.spec.ts
│       ├── production-login-state.test.ts
│       └── scalable-products.spec.ts
├── README.md
├── PROJECT_STRUCTURE.md
├── package.json
├── playwright.config.ts
├── reports/                                 Generated HTML report
├── allure-results/                          Generated Allure data
└── test-results/                             Generated test artifacts
```

## Source directories

| Path | Responsibility |
| --- | --- |
| `src/api/` | Shared API request utilities. |
| `src/config/` | Environment-specific local settings, selected by `ENV`. |
| `src/constants/` | Shared production configuration and login-state definitions. |
| `src/fixtures/` | Shared Playwright fixtures for API and page tests. |
| `src/pages/` | Page objects, registration dialog, and login-state helper. |
| `src/tests/` | Playwright and Node test suites. |

## Test suites

- `scalable-products.spec.ts` covers product pages, registration validation,
  and onboarding scenarios, including locally mocked API writes.
- `api/scalable.auth.spec.ts` covers API authentication behavior.
- `api/users.api.schema.spec.ts` checks user API response schemas and the
  required profile data shape. The profile-schema check uses synthetic values.
- `production-2fa-link.spec.ts` contains checks against the live
  production login experience.
- `production-login-state.test.ts` uses Node's test runner to check login and
  2FA screen-state detection without network access.

## Configuration and reports

`playwright.config.ts` discovers tests from `src/tests/`, loads
`src/config/.env.<ENV>.local` (`ENV` defaults to `production`), and configures Chromium
and Firefox projects. It writes the HTML report to `reports/html-report/`,
Allure results to `allure-results/`, and test artifacts to `test-results/`.

The production login suite runs by default against the live site. Run it only
with authorization. Keep environment files and credentials private; never commit
secrets.

Run the standalone login-state test from the project root:

```powershell
node --import tsx --test src/tests/production-login-state.test.ts
```
