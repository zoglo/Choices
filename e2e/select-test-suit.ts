import { type Locator, type Page } from '@playwright/test';
import { TestSuit } from './test-suit';

export class SelectTestSuit extends TestSuit {
  readonly wrappedSelect: Locator;

  readonly choices: Locator;

  readonly selectableChoices: Locator;

  readonly itemsWithPlaceholder: Locator;

  constructor(page: Page, url: string, testId: string) {
    super(page, url, testId);

    this.wrappedSelect = this.group.locator('select');
    this.choices = this.dropdown.locator('.choices__item');
    this.selectableChoices = this.dropdown.locator('.choices__item:not(.choices__placeholder)');
    this.itemsWithPlaceholder = this.itemList.locator('.choices__item');
  }

  async startWithClick(): Promise<void> {
    await this.start();
    await this.selectByClick();
    await this.expectVisibleDropdown();
  }

  getWrappedElement(): Locator {
    return this.wrappedSelect;
  }
}
