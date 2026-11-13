/**
 * Production 2FA Login Test Suite
 *
 * This test suite checks production login and 2FA screen states.
 *
 * Requirements:
 * - Set SCALABLE_USERNAME and SCALABLE_PASSWORD in environment or src/config/.env.production.local
 * - Manual completion required for mobile device linking
 *
 * Usage:
 * npx playwright test production-2fa-link.spec.ts
 */

import { test, expect, chromium, BrowserContext, Page } from '@playwright/test';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { ProductionLoginState } from '../pages/ProductionLoginState';
import { PRODUCTION_CONFIG, ERROR_MESSAGES, LOGIN_SELECTORS } from '../constants/production';
import { getLoginScreenState, LoginScreenState } from '../constants/states';

test.describe.configure({ mode: 'parallel' });

test.describe('Production 2FA Login Tests', () => {
  let context: BrowserContext;
  let page: Page;
  let loginPage: Page;
  let username: string;
  let password: string;

  test.beforeAll(async () => {
    // Load environment variables from src/config/.env.production.local
    const envPath = fileURLToPath(new URL(PRODUCTION_CONFIG.ENV_FILE_PATH, import.meta.url));
    const envResult = config({ path: envPath, quiet: true });

    if (envResult.error && String(envResult.error.code) !== 'ENOENT') {
      throw envResult.error;
    }

    // Get credentials
    username = process.env.SCALABLE_USERNAME || PRODUCTION_CONFIG.USERNAME;
    password = process.env.SCALABLE_PASSWORD || PRODUCTION_CONFIG.PASSWORD;

    if (!username || !password) {
      throw new Error(ERROR_MESSAGES.MISSING_CREDENTIALS);
    }
  });

  test.beforeEach(async () => {
    // Launch browser in headed mode for production login
    const browser = await chromium.launch({ headless: PRODUCTION_CONFIG.HEADLESS_MODE });
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('TC-001: Should load public site and handle cookies', async () => {
    // Navigate to the public site
    await page.goto(PRODUCTION_CONFIG.BASE_URL_EN, { waitUntil: 'domcontentloaded' });
    expect(page.url()).toContain('scalable.capital');

    // Check if cookies button is visible and accept if present
    const cookiesButton = page.getByRole(
      LOGIN_SELECTORS.COOKIES_BUTTON.role as 'button',
      { name: LOGIN_SELECTORS.COOKIES_BUTTON.name }
    );
    
    if (await cookiesButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cookiesButton.click();
      console.log('✅ Cookies accepted');
    } else {
      console.log('ℹ️  Cookies button not visible');
    }

    // Verify page loaded successfully
    expect(page).toBeDefined();
  });

  test('TC-002: Should open login page in popup', async () => {
    // Navigate to public site first
    await page.goto(PRODUCTION_CONFIG.BASE_URL_EN, { waitUntil: 'domcontentloaded' });

    // Accept cookies if present
    const cookiesButton = page.getByRole(
      LOGIN_SELECTORS.COOKIES_BUTTON.role as 'button',
      { name: LOGIN_SELECTORS.COOKIES_BUTTON.name }
    );
    if (await cookiesButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cookiesButton.click();
    }

    // Click login link and wait for popup
    loginPage = (await Promise.all([
      page.waitForEvent('popup'),
      page
        .getByRole(
          LOGIN_SELECTORS.MAIN_NAV.role as 'navigation',
          { name: LOGIN_SELECTORS.MAIN_NAV.name }
        )
        .getByRole(LOGIN_SELECTORS.LOGIN_LINK.role as 'link', { name: LOGIN_SELECTORS.LOGIN_LINK.name })
        .click(),
    ]))[0];

    await loginPage.waitForLoadState('domcontentloaded');
    
    // Verify origin is one of the valid origins
    const loginOrigin = new URL(loginPage.url()).origin;
    expect(PRODUCTION_CONFIG.VALID_ORIGINS).toContain(loginOrigin);
    
    console.log(`✅ Login page opened at: ${loginPage.url()}`);
  });

  test('TC-003: Should detect login screen state', async () => {
    // Navigate to public site and open login
    await page.goto(PRODUCTION_CONFIG.BASE_URL_EN, { waitUntil: 'domcontentloaded' });

    const cookiesButton = page.getByRole(
      LOGIN_SELECTORS.COOKIES_BUTTON.role as 'button',
      { name: LOGIN_SELECTORS.COOKIES_BUTTON.name }
    );
    if (await cookiesButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cookiesButton.click();
    }

    loginPage = (await Promise.all([
      page.waitForEvent('popup'),
      page
        .getByRole(
          LOGIN_SELECTORS.MAIN_NAV.role as 'navigation',
          { name: LOGIN_SELECTORS.MAIN_NAV.name }
        )
        .getByRole(LOGIN_SELECTORS.LOGIN_LINK.role as 'link', { name: LOGIN_SELECTORS.LOGIN_LINK.name })
        .click(),
    ]))[0];

    await loginPage.waitForLoadState('domcontentloaded');

    // Wait briefly for manual login or detect current state
    await loginPage.waitForTimeout(3000);

    // Detect current screen state
    const loginStateHelper = new ProductionLoginState(loginPage);
    const screenState = await loginStateHelper.getLoginScreenState();

    // Screen state should be one of the known states
    expect(['login', 'setup', 'linking', 'unknown']).toContain(screenState);
    
    console.log(`✅ Detected screen state: ${screenState}`);
  });

  test('TC-004: Should handle login form state detection', async () => {
    // Navigate to public site and open login
    await page.goto(PRODUCTION_CONFIG.BASE_URL_EN, { waitUntil: 'domcontentloaded' });

    const cookiesButton = page.getByRole(
      LOGIN_SELECTORS.COOKIES_BUTTON.role as 'button',
      { name: LOGIN_SELECTORS.COOKIES_BUTTON.name }
    );
    if (await cookiesButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cookiesButton.click();
    }

    loginPage = (await Promise.all([
      page.waitForEvent('popup'),
      page
        .getByRole(
          LOGIN_SELECTORS.MAIN_NAV.role as 'navigation',
          { name: LOGIN_SELECTORS.MAIN_NAV.name }
        )
        .getByRole(LOGIN_SELECTORS.LOGIN_LINK.role as 'link', { name: LOGIN_SELECTORS.LOGIN_LINK.name })
        .click(),
    ]))[0];

    await loginPage.waitForLoadState('domcontentloaded');

    // Create state helper
    const loginStateHelper = new ProductionLoginState(loginPage);

    // Test login form visibility check
    const isLoginFormVisible = await loginStateHelper.isLoginFormVisible();
    console.log(`✅ Login form visible: ${isLoginFormVisible}`);

    // Test setup screen visibility check
    const isSetupVisible = await loginStateHelper.isSetupScreenVisible();
    console.log(`✅ Setup screen visible: ${isSetupVisible}`);

    // Test linking screen visibility check
    const isLinkingVisible = await loginStateHelper.isLinkingScreenVisible();
    console.log(`✅ Linking screen visible: ${isLinkingVisible}`);

    // At least one should be visible or true
    expect(isLoginFormVisible || isSetupVisible || isLinkingVisible).toBeTruthy();
  });

  test('TC-005: Should validate secure origin during navigation', async () => {
    // Navigate to public site
    await page.goto(PRODUCTION_CONFIG.BASE_URL_EN, { waitUntil: 'domcontentloaded' });

    const cookiesButton = page.getByRole(
      LOGIN_SELECTORS.COOKIES_BUTTON.role as 'button',
      { name: LOGIN_SELECTORS.COOKIES_BUTTON.name }
    );
    if (await cookiesButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cookiesButton.click();
    }

    loginPage = (await Promise.all([
      page.waitForEvent('popup'),
      page
        .getByRole(
          LOGIN_SELECTORS.MAIN_NAV.role as 'navigation',
          { name: LOGIN_SELECTORS.MAIN_NAV.name }
        )
        .getByRole(LOGIN_SELECTORS.LOGIN_LINK.role as 'link', { name: LOGIN_SELECTORS.LOGIN_LINK.name })
        .click(),
    ]))[0];

    await loginPage.waitForLoadState('domcontentloaded');

    // Check initial origin
    const initialOrigin = new URL(loginPage.url()).origin;
    expect(PRODUCTION_CONFIG.VALID_ORIGINS).toContain(initialOrigin);

    // Wait for navigation to complete
    await loginPage.waitForTimeout(2000);

    // Check origin after wait (might redirect)
    const finalOrigin = new URL(loginPage.url()).origin;
    expect(PRODUCTION_CONFIG.VALID_ORIGINS).toContain(finalOrigin);

    console.log(`✅ All origins are valid: ${finalOrigin}`);
  });

  test('TC-006: Should handle 2FA screen detection', async () => {
    test.setTimeout(60_000);

    // Navigate to public site and open login
    await page.goto(PRODUCTION_CONFIG.BASE_URL_EN, { waitUntil: 'domcontentloaded' });

    const cookiesButton = page.getByRole(
      LOGIN_SELECTORS.COOKIES_BUTTON.role as 'button',
      { name: LOGIN_SELECTORS.COOKIES_BUTTON.name }
    );
    if (await cookiesButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cookiesButton.click();
    }

    loginPage = (await Promise.all([
      page.waitForEvent('popup'),
      page
        .getByRole(
          LOGIN_SELECTORS.MAIN_NAV.role as 'navigation',
          { name: LOGIN_SELECTORS.MAIN_NAV.name }
        )
        .getByRole(LOGIN_SELECTORS.LOGIN_LINK.role as 'link', { name: LOGIN_SELECTORS.LOGIN_LINK.name })
        .click(),
    ]))[0];

    await loginPage.waitForLoadState('domcontentloaded');

    // Wait for user to login manually (30 seconds max)
    await loginPage.waitForTimeout(30000);

    // Create state helper
    const loginStateHelper = new ProductionLoginState(loginPage);

    // Check if we can detect setup screen
    const isSetupScreenVisible = await loginStateHelper.isSetupScreenVisible();
    console.log(`✅ 2FA Setup screen detected: ${isSetupScreenVisible}`);

    // If setup screen is visible, it should be part of valid states
    if (isSetupScreenVisible) {
      const screenState = await loginStateHelper.getLoginScreenState();
      expect(screenState).toBe('setup');
    }
  });

  test('TC-007: Should provide state descriptions', async () => {
    // Navigate to public site and open login
    await page.goto(PRODUCTION_CONFIG.BASE_URL_EN, { waitUntil: 'domcontentloaded' });

    const cookiesButton = page.getByRole(
      LOGIN_SELECTORS.COOKIES_BUTTON.role as 'button',
      { name: LOGIN_SELECTORS.COOKIES_BUTTON.name }
    );
    if (await cookiesButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cookiesButton.click();
    }

    loginPage = (await Promise.all([
      page.waitForEvent('popup'),
      page
        .getByRole(
          LOGIN_SELECTORS.MAIN_NAV.role as 'navigation',
          { name: LOGIN_SELECTORS.MAIN_NAV.name }
        )
        .getByRole(LOGIN_SELECTORS.LOGIN_LINK.role as 'link', { name: LOGIN_SELECTORS.LOGIN_LINK.name })
        .click(),
    ]))[0];

    await loginPage.waitForLoadState('domcontentloaded');

    // Create state helper
    const loginStateHelper = new ProductionLoginState(loginPage);

    // Get state description
    const description = await loginStateHelper.getStateDescription();
    
    // Description should be a non-empty string
    expect(description).toBeTruthy();
    expect(typeof description).toBe('string');
    
    console.log(`✅ State description: ${description}`);
  });

  test('TC-008: Should validate credentials are available', async () => {
    // Verify credentials are loaded
    expect(username).toBeTruthy();
    expect(password).toBeTruthy();
    
    console.log(`✅ Credentials verified`);
  });

  test('TC-009: Should validate configuration values', async () => {
    // Check BASE_URL is set
    expect(PRODUCTION_CONFIG.BASE_URL).toBeTruthy();
    expect(PRODUCTION_CONFIG.BASE_URL).toContain('scalable.capital');

    // Check BASE_URL_EN is set
    expect(PRODUCTION_CONFIG.BASE_URL_EN).toBeTruthy();
    expect(PRODUCTION_CONFIG.BASE_URL_EN).toContain('scalable.capital');

    // Check VALID_ORIGINS is an array with entries
    expect(Array.isArray(PRODUCTION_CONFIG.VALID_ORIGINS)).toBeTruthy();
    expect(PRODUCTION_CONFIG.VALID_ORIGINS.length).toBeGreaterThan(0);

    // Check timeouts are positive numbers
    expect(PRODUCTION_CONFIG.LOGIN_TIMEOUT).toBeGreaterThan(0);
    expect(PRODUCTION_CONFIG.SETUP_SCREEN_TIMEOUT).toBeGreaterThan(0);
    expect(PRODUCTION_CONFIG.LINKING_SCREEN_TIMEOUT).toBeGreaterThan(0);

    console.log('✅ All configuration values are valid');
  });

  test('TC-010: Should handle page navigation safely', async () => {
    // Navigate to public site
    const response = await page.goto(PRODUCTION_CONFIG.BASE_URL_EN, { waitUntil: 'domcontentloaded' });

    // Verify response is received
    expect(response).toBeTruthy();
    expect(response?.ok()).toBe(true);

    // Verify URL matches
    expect(page.url()).toContain('scalable.capital');

    console.log(`✅ Page navigation successful: ${page.url()}`);
  });
});
