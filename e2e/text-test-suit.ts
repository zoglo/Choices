import { type Locator, type Page } from '@playwright/test';
import { TestSuit } from './test-suit';

export class TextTestSuit extends TestSuit {
  readonly wrappedInput: Locator;

  constructor(page: Page, url: string, testId: string) {
    super(page, url, testId);

    this.wrappedInput = this.group.locator('input[hidden]');
  }

  getWrappedElement(): Locator {
    return this.wrappedInput;
  }
}
