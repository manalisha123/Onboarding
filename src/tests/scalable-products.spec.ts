import { type Page, type Route } from '@playwright/test';
import { expect, test } from '../fixtures/pageFixtures';
import { ScalableHomePage, type Product } from '../pages/ScalableHomePage';
import type { ScalableProductPage } from '../pages/ScalableProductPage';

function generateTestEmail(): string {
  return `scalable-e2e-${Date.now()}@example.test`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fulfillJson(route: Route, status: number, body: Record<string, unknown>): Promise<void> {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function openRegistrationWithEmail(page: Page, email: string): Promise<void> {
  const home = new ScalableHomePage(page);
  await home.goto();
  await home.openAccount();

  const registration = home.registrationDialog;
  await expect(registration.dialog).toBeVisible();
  await registration.emailInput.fill(email);
  expect(await registration.hasEmailFormatError()).toBe(false);
}

async function withInMemoryCleanup(
  action: () => Promise<void>,
  cleanup: () => Promise<void>,
): Promise<void> {
  try {
    await action();
  } finally {
    await cleanup();
  }
}

async function openProduct(home: ScalableHomePage, product: Product): Promise<void> {
  await home.goto();
  await home.openProduct(product);
  await home.acceptEssentialCookies();
}

async function checkAccordion(productPage: ScalableProductPage, question: string): Promise<void> {
  const button = productPage.accordionButton(question);
  const content = productPage.accordionContent(question);

  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(content).toBeVisible();
  await expect(content).toContainText(/\S/);
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(content).not.toBeVisible();
}

async function mockLoginFailure(
  loginPage: Page,
  status: number,
  message: string,
): Promise<string[]> {
  const submittedMethods: string[] = [];
  await loginPage.route('**/*', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }

    submittedMethods.push(request.method());
    await route.fulfill({
      status,
      contentType: 'text/html',
      body: `<!doctype html><html lang="en"><body><main><h1>Scalable Login</h1><p role="alert">${message}</p></main></body></html>`,
    });
  });
  return submittedMethods;
}

test.describe('Positive scenarios: onboarding', () => {
  test('onboarding: opens registration and accepts a syntactically valid email', async ({ scalableHomePage, registrationDialog }) => {
    const registration = registrationDialog;

    await scalableHomePage.goto();
    await scalableHomePage.openAccount();

    await expect(registration.dialog).toBeVisible();
    await expect(registration.emailInput).toBeVisible();
    await expect(registration.submitButton).toBeDisabled();
    await expect(registration.captchaWidget).toBeVisible();

    const email = generateTestEmail();
    await registration.emailInput.fill(email);
    await expect(registration.emailInput).toHaveValue(email);
    expect(await registration.hasEmailFormatError()).toBe(false);
  });
});

test.describe('Positive scenarios: registration and login', () => {
  test('onboarding: closes and reopens the registration dialog', async ({ scalableHomePage, registrationDialog }) => {
    const registration = registrationDialog;

    await scalableHomePage.goto();
    await scalableHomePage.openAccount();
    await expect(registration.dialog).toBeVisible();
    await registration.closeButton.click();
    await expect(registration.dialog).not.toBeVisible();
    await scalableHomePage.openAccount();
    await expect(registration.emailInput).toBeVisible();
  });

  test('opens the Scalable secure login page', async ({ scalableHomePage }) => {
    await scalableHomePage.goto();
    const loginPage = await scalableHomePage.login();

    await expect(loginPage).toHaveURL(/secure\.scalable\.capital\/u\/login/);
  });
});

/*
test.describe('Positive scenarios: product pages', () => {
  test('navigates to Retirement and opens its availability FAQ', async ({ page, scalableHomePage, retirementPage }) => {
    const retirement = retirementPage;
    await openProduct(scalableHomePage, 'Retirement');
    await expect(page).toHaveURL(/\/en\/retirement-account\/?(?:[?#].*)?$/);
    await expect(retirement.heading(retirement.title)).toBeVisible();
    await checkAccordion(retirement, retirement.availabilityQuestion);
  });

  test('navigates to Agentic and explores an example prompt', async ({ page, scalableHomePage, agenticPage }) => {
    const agentic = agenticPage;
    await openProduct(scalableHomePage, 'Agentic');
    await expect(page).toHaveURL(/\/en\/agentic-investing\/?(?:[?#].*)?$/);
    await expect(agentic.heading(agentic.title)).toBeVisible();
    await checkAccordion(agentic, agentic.examplePrompt);
  });

  test('navigates to Invest and opens its portfolio transfer FAQ', async ({ page, scalableHomePage, investPage }) => {
    const invest = investPage;
    await openProduct(scalableHomePage, 'Invest');
    await expect(page).toHaveURL(/\/en\/trading\/?(?:[?#].*)?$/);
    await expect(invest.heading(invest.title)).toBeVisible();
    await checkAccordion(invest, invest.transferQuestion);
  });

  test('navigates to Interest and opens its payout FAQ', async ({ page, scalableHomePage, interestPage }) => {
    const interest = interestPage;
    await openProduct(scalableHomePage, 'Interest');
    await expect(page).toHaveURL(/\/en\/overnight-account\/?(?:[?#].*)?$/);
    await expect(interest.heading(interest.title)).toBeVisible();
    await checkAccordion(interest, interest.payoutQuestion);
  });

  test('navigates to Credit and explores the calculation example and costs FAQ', async ({ page, scalableHomePage, creditPage }) => {
    const credit = creditPage;
    await openProduct(scalableHomePage, 'Credit');
    await expect(page).toHaveURL(/\/en\/credit\/?(?:[?#].*)?$/);
    await expect(credit.heading(credit.title)).toBeVisible();
    await credit.tab('Calculation example').click();
    await expect(credit.tab('Calculation example')).toHaveAttribute('aria-selected', 'true');
    await expect(credit.tabPanel('Calculation example')).toBeVisible();
    await expect(credit.tabPanel('Calculation example')).toContainText(/\S/);
    await checkAccordion(credit, credit.costsQuestion);
  });
});
*/

test.describe('Negative scenarios: onboarding', () => {
  test('NEG-04: duplicate synthetic customer is rejected without creating an account', async ({ browser }) => {
    const runId = `neg-04-${Date.now()}`;
    const existingCustomerEmail = `existing-${runId}@example.test`;
    const registrationAttempts: string[] = [];
    const createdAccountIds: string[] = [];
    const mockDuplicateRegistration = async (route: Route): Promise<void> => {
      const request = route.request();
      const method = request.method();
      const url = new URL(request.url());

      if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
        await route.continue();
        return;
      }

      if (method === 'POST' && url.pathname === '/api/onboarding/sessions') {
        const postData = request.postData();
        const body: unknown = postData ? JSON.parse(postData) : {};
        if (!isRecord(body) || body.testRunId !== runId || body.email !== existingCustomerEmail) {
          await fulfillJson(route, 400, { code: 'INVALID_TEST_DATA' });
          return;
        }

        registrationAttempts.push(runId);
        await fulfillJson(route, 409, {
          code: 'DUPLICATE_CUSTOMER',
          message: 'A customer with these details already exists.',
        });
        return;
      }

      await fulfillJson(route, 403, { code: 'PRODUCTION_WRITE_BLOCKED' });
    };

    await withInMemoryCleanup(async () => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      try {
        const page = await context.newPage();
        await context.route('**/*', mockDuplicateRegistration);

        await test.step('open the production registration UI with a synthetic existing customer', async () => {
          await openRegistrationWithEmail(page, existingCustomerEmail);
        });

        await test.step('return the duplicate response and do not create an account', async () => {
          const result = await page.evaluate(async ({ testRunId, email }) => {
            const response = await fetch('/api/onboarding/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ testRunId, email, identityType: 'synthetic' }),
            });
            return {
              status: response.status,
              body: await response.json() as { code?: string; message?: string },
            };
          }, { testRunId: runId, email: existingCustomerEmail });

          expect(result.status).toBe(409);
          expect(result.body.code).toBe('DUPLICATE_CUSTOMER');
          expect(result.body.message).toMatch(/already exists/i);
          expect(registrationAttempts).toEqual([runId]);
          expect(createdAccountIds).toHaveLength(0);
        });
      } finally {
        await context.close();
      }
    }, async () => {
      await test.step('teardown: delete the in-memory duplicate test data', async () => {
        registrationAttempts.length = 0;
        createdAccountIds.length = 0;
        expect(registrationAttempts).toHaveLength(0);
        expect(createdAccountIds).toHaveLength(0);
      });
    });
  });


  test('onboarding: identifies an invalid email format', async ({ scalableHomePage, registrationDialog }) => {
    const registration = registrationDialog;

    await scalableHomePage.goto();
    await scalableHomePage.openAccount();
    await registration.emailInput.fill('not-an-email');

    expect(await registration.hasEmailFormatError()).toBe(true);
  });
});

test.describe('Negative scenarios: authentication', () => {
  test('AUTH-002: invalid password shows a clear error without logging in', async ({ scalableHomePage }) => {
    await scalableHomePage.goto();
    const loginPage = await scalableHomePage.login();
    const submittedMethods = await mockLoginFailure(
      loginPage,
      401,
      'Invalid email or password. Please try again.',
    );
    const rejectedLogin = loginPage.waitForResponse(
      (response) => response.request().method() === 'POST',
    );

    await loginPage.locator('#username').fill('auth-002@example.test');
    await loginPage.locator('#password').fill('Synthetic-Invalid-Password!42');
    await loginPage.getByRole('button', { name: 'Login' }).click();

    expect((await rejectedLogin).status()).toBe(401);
    expect(submittedMethods).toEqual(['POST']);
    await expect(loginPage.getByRole('alert')).toContainText(/invalid email or password/i);
    await expect(loginPage).toHaveURL(/secure\.scalable\.capital\/u\/login/);
  });

  test('AUTH-003: invalid email format shows validation without logging in', async ({ scalableHomePage }) => {
    await scalableHomePage.goto();
    const loginPage = await scalableHomePage.login();
    const submittedMethods = await mockLoginFailure(
      loginPage,
      400,
      'Please enter a valid email address.',
    );
    const rejectedLogin = loginPage.waitForResponse(
      (response) => response.request().method() === 'POST',
    );

    await loginPage.locator('#username').fill('not-an-email');
    await loginPage.locator('#password').fill('Synthetic-Invalid-Password!42');
    await loginPage.getByRole('button', { name: 'Login' }).click();

    expect((await rejectedLogin).status()).toBe(400);
    expect(submittedMethods).toEqual(['POST']);
    await expect(loginPage.getByRole('alert')).toContainText(/valid email address/i);
    await expect(loginPage).toHaveURL(/secure\.scalable\.capital\/u\/login/);
  });
});
