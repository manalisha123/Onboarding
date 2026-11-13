import { test as baseTest } from '@playwright/test';
import { AgenticPage } from '../pages/AgenticPage';
import { CreditPage } from '../pages/CreditPage';
import { InterestPage } from '../pages/InterestPage';
import { InvestPage } from '../pages/InvestPage';
import { ProductionLoginState } from '../pages/ProductionLoginState';
import { RegistrationDialog } from '../pages/RegistrationDialog';
import { RetirementPage } from '../pages/RetirementPage';
import { ScalableHomePage } from '../pages/ScalableHomePage';
import { ScalableProductPage } from '../pages/ScalableProductPage';

type PageFixtures = {
  scalableHomePage: ScalableHomePage;
  registrationDialog: RegistrationDialog;
  scalableProductPage: ScalableProductPage;
  agenticPage: AgenticPage;
  creditPage: CreditPage;
  interestPage: InterestPage;
  investPage: InvestPage;
  retirementPage: RetirementPage;
  productionLoginState: ProductionLoginState;
};

export const test = baseTest.extend<PageFixtures>({
  scalableHomePage: async ({ page }, use) => {
    await use(new ScalableHomePage(page));
  },

  registrationDialog: async ({ page }, use) => {
    await use(new RegistrationDialog(page));
  },

  scalableProductPage: async ({ page }, use) => {
    await use(new ScalableProductPage(page));
  },

  agenticPage: async ({ page }, use) => {
    await use(new AgenticPage(page));
  },

  creditPage: async ({ page }, use) => {
    await use(new CreditPage(page));
  },

  interestPage: async ({ page }, use) => {
    await use(new InterestPage(page));
  },

  investPage: async ({ page }, use) => {
    await use(new InvestPage(page));
  },

  retirementPage: async ({ page }, use) => {
    await use(new RetirementPage(page));
  },

  productionLoginState: async ({ page }, use) => {
    await use(new ProductionLoginState(page));
  },
});

export { expect } from '@playwright/test';
