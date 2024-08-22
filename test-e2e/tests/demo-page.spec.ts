import { expect } from '@playwright/test';
import { test } from '../bundle-test';
import { SelectTestSuit } from '../select-test-suit';
// import { mkdirSync } from 'fs';
// import path from 'path';

const { describe } = test;
// describe.configure({ mode: 'serial', retries: 0 });

describe(`Choices`, () => {
  const testUrl = '/index.html';
  const testId = 'custom-templates';
  test.setTimeout(30000);

  test('screenshot', async ({ page, bundle }) => {
    const suite = new SelectTestSuit(page, bundle, testUrl, testId);

    await page.routeFromHAR('./test-e2e/hars/discogs.har', {
      url: 'https://api.discogs.com/**',
      update: false, // https://playwright.dev/docs/mock#replaying-from-har
    });

    await suite.startWithClick();
    await suite.expectVisibleDropdown();
    await suite.input.press('ArrowDown');
    await suite.input.press('ArrowDown');
    await suite.advanceClock();

    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixels: 200,
      timeout: 30000,
    });
  });
});
