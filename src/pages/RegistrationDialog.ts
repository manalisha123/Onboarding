import { type Locator, type Page } from '@playwright/test';

export class RegistrationDialog {
  readonly dialog: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly captchaWidget: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.dialog = page.getByRole('dialog').filter({
      has: page.getByRole('textbox', { name: 'E-mail address' }),
    });
    this.emailInput = this.dialog.getByRole('textbox', { name: 'E-mail address' });
    this.submitButton = this.dialog.getByRole('button', { name: 'Open account', exact: true });
    this.captchaWidget = this.dialog.locator('iframe[title="Anti-Robot verification - Widget"]');
    this.closeButton = this.dialog.getByRole('button', { name: 'Close', exact: true });
  }

  async hasEmailFormatError(): Promise<boolean> {
    return this.emailInput.evaluate((element) => {
      if (!(element instanceof HTMLInputElement)) {
        throw new Error('Registration email field is not an input element');
      }
      return element.validity.typeMismatch;
    });
  }
}
