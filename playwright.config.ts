import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

const ENV = process.env.ENV || "production";
config({ path: `src/config/.env.${ENV}.local` });

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '50%' : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "reports/html-report", open: "never" }],
    ["allure-playwright", {
      outputFolder: "allure-results",
      suiteTitle: true,
    }],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
