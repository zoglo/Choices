import { expect } from '@playwright/test';
import { test } from '../bundle-test';
import { TestSuit } from '../test-suit';
// import { mkdirSync } from 'fs';
// import path from 'path';

const { describe } = test;
// describe.configure({ mode: 'serial', retries: 0 });

describe(`Choices`, () => {
  const testUrl = '/index.html';
  const testId = 'reset-simple';
  test.setTimeout(30000);

  test('screenshot', async ({ page, bundle }) => {
    const suite = new TestSuit(page, bundle, testUrl, testId);

    await page.routeFromHAR('./test-e2e/hars/discogs.har', {
      url: 'https://api.discogs.com/**',
      update: false, // https://playwright.dev/docs/mock#replaying-from-har
    });

    await suite.start();

    await page.click('label[for="choices-single-custom-templates"]');
    await suite.input.press('ArrowDown');
    await suite.input.press('ArrowDown');

    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixels: 200,
      timeout: 30000,
    });
  });
});
