import { type Locator } from '@playwright/test';
import { ScalableProductPage } from './ScalableProductPage';

export class CreditPage extends ScalableProductPage {
  readonly title = 'Wall Street Credibility';
  readonly costsQuestion = 'What are the costs for Credit?';

  tab(name: string): Locator {
    return this.page.getByRole('tab', { name, exact: true });
  }

  tabPanel(name: string): Locator {
    return this.page.getByRole('tabpanel', { name, exact: true });
  }
}
