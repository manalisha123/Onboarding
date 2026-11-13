import type { Page } from '@playwright/test';
import { LoginScreenState, LOGIN_STATE_SELECTORS, STATE_DESCRIPTIONS } from '../constants';

/**
 * Page Object for Production Login State Detection
 * Handles different login screen states: login, setup, linking, unknown
 */

export class ProductionLoginState {
  constructor(private page: Page) {}

  /**
   * Detect the current state of the login screen
   * @returns The current login screen state
   */
  async getLoginScreenState(): Promise<LoginScreenState> {
    const setupHeading = this.page.getByRole('heading', {
      name: /set up two-factor authentication/i,
    });
    const linkingHeading = this.page.getByRole('heading', {
      name: /link a mobile device to your account/i,
    });

    if (await linkingHeading.isVisible()) return LoginScreenState.LINKING;
    if (await setupHeading.isVisible()) return LoginScreenState.SETUP;
    if (
      (await this.page.locator(LOGIN_STATE_SELECTORS.usernameInput).isVisible()) &&
      (await this.page.locator(LOGIN_STATE_SELECTORS.passwordInput).isVisible()) &&
      (await this.page.locator(LOGIN_STATE_SELECTORS.submitButton).isVisible())
    ) {
      return LoginScreenState.LOGIN;
    }
    return LoginScreenState.UNKNOWN;
  }

  /**
   * Get description of current screen state
   */
  async getStateDescription(): Promise<string> {
    const state = await this.getLoginScreenState();
    return STATE_DESCRIPTIONS[state];
  }

  /**
   * Check if the login form is visible
   */
  async isLoginFormVisible(): Promise<boolean> {
    return (
      (await this.page.locator(LOGIN_STATE_SELECTORS.usernameInput).isVisible()) &&
      (await this.page.locator(LOGIN_STATE_SELECTORS.passwordInput).isVisible()) &&
      (await this.page.locator(LOGIN_STATE_SELECTORS.submitButton).isVisible())
    );
  }

  /**
   * Check if the 2FA setup screen is visible
   */
  async isSetupScreenVisible(): Promise<boolean> {
    const setupHeading = this.page.getByRole('heading', {
      name: /set up two-factor authentication/i,
    });
    return await setupHeading.isVisible();
  }

  /**
   * Check if the mobile device linking screen is visible
   */
  async isLinkingScreenVisible(): Promise<boolean> {
    const linkingHeading = this.page.getByRole('heading', {
      name: /link a mobile device to your account/i,
    });
    return await linkingHeading.isVisible();
  }

  /**
   * Fill in username field
   */
  async fillUsername(username: string): Promise<void> {
    await this.page.locator(LOGIN_STATE_SELECTORS.usernameInput).fill(username);
  }

  /**
   * Fill in password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.page.locator(LOGIN_STATE_SELECTORS.passwordInput).fill(password);
  }

  /**
   * Submit the login form
   */
  async submitLoginForm(): Promise<void> {
    await this.page.locator(LOGIN_STATE_SELECTORS.submitButton).click();
  }

  /**
   * Click the Continue button (for 2FA setup)
   */
  async clickContinueButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
  }

  /**
   * Wait for the 2FA setup or linking screen
   */
  async waitForTwoFactorScreen(timeout: number = 45000): Promise<void> {
    const setupHeading = this.page.getByRole('heading', {
      name: /set up two-factor authentication/i,
    });
    const linkingHeading = this.page.getByRole('heading', {
      name: /link a mobile device to your account/i,
    });
    await setupHeading.or(linkingHeading).first().waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for the mobile device linking instructions screen
   */
  async waitForLinkingInstructions(timeout: number = 30000): Promise<void> {
    const linkingHeading = this.page.getByRole('heading', {
      name: /link a mobile device to your account/i,
    });
    await linkingHeading.waitFor({ state: 'visible', timeout });
  }
}

/**
 * Helper function for backward compatibility
 * @deprecated Use ProductionLoginState class instead
 */
export async function getLoginScreenState(page: Page): Promise<LoginScreenState> {
  const loginState = new ProductionLoginState(page);
  return loginState.getLoginScreenState();
}
