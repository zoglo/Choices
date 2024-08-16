import { type Locator, type Page } from '@playwright/test';
import { TestSuit } from './test-suit';

export class TextTestSuit extends TestSuit {
  readonly wrappedInput: Locator;

  constructor(page: Page, baseURL: string | undefined, choicesBundle: string, url: string, testId: string) {
    super(page, baseURL, choicesBundle, url, testId);

    this.wrappedInput = this.group.locator('input[hidden]');
  }

  getWrappedElement(): Locator {
    return this.wrappedInput;
  }
}
