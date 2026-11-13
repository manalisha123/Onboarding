/**
 * Production Environment Constants
 * Configuration and URLs for production testing
 */

export const PRODUCTION_CONFIG = {
  // Base URLs
  BASE_URL: process.env.BASE_URL || 'https://secure.scalable.capital',
  BASE_URL_EN: 'https://de.scalable.capital/en',
  LOGIN_URL: 'https://secure.scalable.capital',
  
  // Valid origins for production environment
  VALID_ORIGINS: ['https://secure.scalable.capital', 'https://de.scalable.capital'],

  // Credentials (from environment variables)
  USERNAME: process.env.SCALABLE_USERNAME || '',
  PASSWORD: process.env.SCALABLE_PASSWORD || '',

  // Timeouts
  LOGIN_TIMEOUT: 60_000, // 1 minute for manual login
  SETUP_SCREEN_TIMEOUT: 45_000, // 45 seconds for setup screen
  LINKING_SCREEN_TIMEOUT: 30_000, // 30 seconds for linking screen
  BROWSER_LAUNCH_TIMEOUT: 30_000, // 30 seconds for browser launch

  // Security
  ENV_FILE_PATH: '../config/.env.production.local',

  // Headless mode
  HEADLESS_MODE: false, // Use headed mode for production login
};

/**
 * Login Screen States
 */
export enum LoginScreenState {
  LOGIN = 'login',
  SETUP = 'setup',
  LINKING = 'linking',
  UNKNOWN = 'unknown',
}

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: 'Set SCALABLE_USERNAME and SCALABLE_PASSWORD in the local environment or src/config/.env.production.local.',
  INSECURE_ORIGIN: (origin: string) =>
    `The page navigated away from the expected secure origin. Got: ${origin}`,
  NO_LOGIN_FORM: 'Neither the login form nor a recognised 2FA screen is visible; no login was submitted.',
  UNEXPECTED_STATE: (stage: string) =>
    `Unable to continue while ${stage}. Check the browser screen and credentials; no retry was attempted.`,
};

/**
 * Selectors for login elements
 */
export const LOGIN_SELECTORS = {
  USERNAME_FIELD: '#username',
  PASSWORD_FIELD: '#password',
  SUBMIT_BUTTON: 'button[type="submit"]',
  SETUP_HEADING: {
    role: 'heading',
    name: /set up two-factor authentication/i,
  },
  LINKING_HEADING: {
    role: 'heading',
    name: /link a mobile device to your account/i,
  },
  CONTINUE_BUTTON: {
    role: 'button',
    name: 'Continue',
    exact: true,
  },
  COOKIES_BUTTON: {
    role: 'button',
    name: 'Only essentials',
  },
  LOGIN_LINK: {
    role: 'link',
    name: 'Login',
  },
  MAIN_NAV: {
    role: 'navigation',
    name: 'Main Navigation',
  },
};
