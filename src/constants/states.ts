import type { Page } from 'playwright';

/**
 * Login screen states for production authentication flow
 */
export enum LoginScreenState {
  LOGIN = 'login',
  SETUP = 'setup',
  LINKING = 'linking',
  UNKNOWN = 'unknown',
}

/**
 * Selectors for detecting different login screen states
 */
export const LOGIN_STATE_SELECTORS = {
  setupHeading: 'heading:has-text("Set up two-factor authentication")',
  linkingHeading: 'heading:has-text("Link a mobile device to your account")',
  usernameInput: '#username',
  passwordInput: '#password',
  submitButton: 'button[type="submit"]',
} as const;

/**
 * Detects the current login screen state
 * @param page - Playwright Page object
 * @returns Current login screen state
 */
export async function getLoginScreenState(page: Page): Promise<LoginScreenState> {
  const setupHeading = page.getByRole('heading', { name: /set up two-factor authentication/i });
  const linkingHeading = page.getByRole('heading', { name: /link a mobile device to your account/i });

  if (await linkingHeading.isVisible()) return LoginScreenState.LINKING;
  if (await setupHeading.isVisible()) return LoginScreenState.SETUP;
  if (await page.locator(LOGIN_STATE_SELECTORS.usernameInput).isVisible() &&
      await page.locator(LOGIN_STATE_SELECTORS.passwordInput).isVisible() &&
      await page.locator(LOGIN_STATE_SELECTORS.submitButton).isVisible()) {
    return LoginScreenState.LOGIN;
  }
  return LoginScreenState.UNKNOWN;
}

/**
 * State descriptions for logging and debugging
 */
export const STATE_DESCRIPTIONS: Record<LoginScreenState, string> = {
  [LoginScreenState.LOGIN]: 'Login screen with username and password fields',
  [LoginScreenState.SETUP]: 'Two-factor authentication setup screen',
  [LoginScreenState.LINKING]: 'Mobile device linking screen',
  [LoginScreenState.UNKNOWN]: 'Unknown or unexpected screen',
} as const;
