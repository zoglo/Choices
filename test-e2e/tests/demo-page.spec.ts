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
    // const artifactsPath = 'screenshot';
    // const browser = 'firefail';
    // const snapshotName = `${process.platform}-${browser}.png`;

    const suite = new TestSuit(page, bundle, testUrl, testId);

    await suite.start();

    await page.click('label[for="choices-single-custom-templates"]');
    await suite.input.press('ArrowDown');
    await suite.input.press('ArrowDown');

    /*
    mkdirSync(artifactsPath, { recursive: true });
    await page.screenshot({
      path: path.join(artifactsPath, snapshotName),
      fullPage: true,
    });
*/

    await expect(page).toHaveScreenshot({
      fullPage: true,
      maxDiffPixels: 200,
      timeout: 30000,
    });
  });
});
