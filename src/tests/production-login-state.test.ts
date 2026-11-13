import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { chromium } from 'playwright';
import { getLoginScreenState, LoginState } from '../constants';

test('recognises login and manual 2FA screens without network access', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ offline: true });
    const page = await context.newPage();

    await page.setContent('<input id="username"><input id="password"><button type="submit">Login</button>');
    assert.equal(await getLoginScreenState(page), 'login');

    await page.setContent('<h1>Set up two-factor authentication</h1>');
    assert.equal(await getLoginScreenState(page), 'setup');

    await page.setContent('<h1>Link a mobile device to your account</h1>');
    assert.equal(await getLoginScreenState(page), 'linking');

    await page.setContent('<h1>Unexpected screen</h1>');
    assert.equal(await getLoginScreenState(page), 'unknown');

    await context.close();
  } finally {
    await browser.close();
  }
});
