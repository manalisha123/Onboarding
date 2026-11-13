import { errors, type Locator, type Page } from '@playwright/test';
import { RegistrationDialog } from './RegistrationDialog';

export type Product = 'Retirement' | 'Agentic' | 'Invest' | 'Interest' | 'Credit';

export class ScalableHomePage {
  private readonly page: Page;
  readonly registrationDialog: RegistrationDialog;
  private readonly essentialCookiesButton: Locator;
  private readonly loginLink: Locator;
  private readonly openAccountButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.registrationDialog = new RegistrationDialog(page);
    this.essentialCookiesButton = page.getByRole('button', {
      name: 'Only essentials',
    });
    this.loginLink = page
      .getByRole('navigation', { name: 'Main Navigation' })
      .getByRole('link', { name: 'Login' });
    this.openAccountButton = page
      .getByRole('navigation', { name: 'Main Navigation' })
      .getByRole('button', { name: 'Open account' });
  }

  async goto(): Promise<void> {
    await this.page.goto('https://de.scalable.capital/en');
    await this.acceptEssentialCookies();
  }

  async acceptEssentialCookies(): Promise<void> {
    try {
      await this.essentialCookiesButton.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        return;
      }
      throw error;
    }
    await this.essentialCookiesButton.click();
  }

  async openAccount(): Promise<void> {
    await this.openAccountButton.click();
  }

  async openProduct(product: Product): Promise<void> {
    const navigation = this.page
      .getByRole('navigation', { name: 'Main Navigation' })
      .getByRole('navigation', { name: 'Main', exact: true });

    if (product === 'Agentic' || product === 'Credit') {
      await navigation.getByRole('link', { name: product, exact: true }).click();
      return;
    }

    const menuLinks = {
      Retirement: 'Retirement account',
      Invest: 'Broker',
      Interest: 'Overnight account',
    };
    const menuButton = navigation.getByRole('button', { name: product, exact: true });
    await menuButton.focus();
    await menuButton.press('Enter');
    const productLink = navigation.getByRole('link', { name: menuLinks[product], exact: true });
    await productLink.waitFor({ state: 'visible' });
    await productLink.focus();
    await productLink.press('Enter');
  }

  async login(): Promise<Page> {
    const loginPagePromise = this.page.waitForEvent('popup');
    await this.loginLink.click();
    const loginPage = await loginPagePromise;
    await loginPage.waitForLoadState('domcontentloaded');
    return loginPage;
  }
}
