import { type Locator, type Page } from '@playwright/test';

export class ScalableProductPage {
  constructor(protected readonly page: Page) {}

  heading(name: string): Locator {
    return this.page.getByRole('heading', { name, exact: true });
  }

  accordionButton(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }

  accordionContent(name: string): Locator {
    return this.page.getByRole('region', { name, exact: true });
  }
}
