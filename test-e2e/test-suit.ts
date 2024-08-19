import { expect, type Locator, type Page } from '@playwright/test';
import { sanitise } from '../src/scripts/lib/utils';

export class TestSuit {
  readonly testId: string;

  readonly url: string;

  readonly page: Page;

  readonly group: Locator;

  readonly input: Locator;

  readonly wrapper: Locator;

  readonly itemList: Locator;

  readonly items: Locator;

  readonly dropdown: Locator;

  readonly choicesBundle: string | undefined;

  constructor(page: Page, choicesBundle: string | undefined, url: string, testId: string) {
    this.choicesBundle = choicesBundle;
    this.testId = testId;
    this.url = url;
    this.page = page;
    this.group = page.getByTestId(this.testId);
    this.input = this.group.locator('input[type="search"]');
    this.wrapper = this.group.locator('.choices').first();
    this.itemList = this.group.locator('.choices__list.choices__list--multiple, .choices__list.choices__list--single');
    this.items = this.itemList.locator('.choices__item:not(.choices__placeholder)');
    this.dropdown = this.group.locator('.choices__list.choices__list--dropdown');
  }

  async start(textInput?: string): Promise<void> {
    if (this.choicesBundle) {
      await this.page.route('/assets/scripts/choices.js', (route) => route.continue({ url: this.choicesBundle }));
      await this.page.route('/assets/scripts/choices.min.js', (route) => route.continue({ url: this.choicesBundle }));
    }

    // disable google analytics, as it can weirdly fail sometimes
    await this.page.route('https://www.google-analytics.com/analytics.js', (route) => route.abort('blockedbyresponse'));
    await this.page.clock.install();

    await this.page.goto(this.url);

    await this.group.scrollIntoViewIfNeeded();
    await this.advanceClock();

    if (textInput) {
      await this.typeTextAndEnter(textInput);
    } else {
      await this.wrapper.focus();
      await this.advanceClock();
    }
  }

  async advanceClock(): Promise<void> {
    // dropdown uses requestAnimationFrame for show/hide
    await this.page.clock.runFor(1000);
  }

  async selectByKeyPress(textInput: string): Promise<void> {
    await this.wrapper.focus();
    await this.advanceClock();
    await this.input.pressSequentially(textInput);
    await this.advanceClock();
    await this.expectVisibleDropdown();
  }

  async selectByClick(): Promise<void> {
    await this.wrapper.click();
    await this.advanceClock();
    await this.expectVisibleDropdown();
  }

  async typeTextAndEnter(textInput: string): Promise<void> {
    await this.typeText(textInput);
    await this.enterKey();
  }

  async typeText(textInput: string): Promise<void> {
    await this.input.focus();
    await this.advanceClock();

    await this.input.fill(textInput);
    await this.advanceClock();
  }

  async ctrlA(): Promise<void> {
    await this.input.focus();
    await this.advanceClock();

    await this.input.press('ControlOrMeta+a');
    await this.advanceClock();
  }

  async enterKey(): Promise<void> {
    await this.input.focus();
    await this.advanceClock();

    await this.input.press('Enter');
    await this.advanceClock();
  }

  async escapeKey(): Promise<void> {
    await this.input.focus();
    await this.advanceClock();

    await this.input.press('Escape');
    await this.advanceClock();
  }

  async backspaceKey(): Promise<void> {
    await this.input.focus();
    await this.advanceClock();

    await this.input.press('Backspace');
    await this.advanceClock();
  }


  async expectVisibleDropdown(text?: string): Promise<void> {
    await this.advanceClock();

    if (text) {
      await expect(this.dropdown).toHaveText(text);
    }

    await this.dropdown.waitFor({ state: 'visible' });
    await expect(this.dropdown).toBeVisible();
  }

  async expectVisibleNoticeHtml(html: string): Promise<void> {
    await this.advanceClock();

    expect(await this.dropdown.locator('.choices__notice').innerHTML()).toEqual(html);
    await this.dropdown.waitFor({ state: 'visible' });
    await expect(this.dropdown).toBeVisible();
  }

  async expectHiddenDropdown(): Promise<void> {
    await this.advanceClock();
    await this.dropdown.waitFor({ state: 'hidden' });
    await expect(this.dropdown).toBeHidden();
  }

  // eslint-disable-next-line class-methods-use-this
  getWrappedElement(): Locator {
    throw new Error('Not implemented');
  }

  async expectedValue(text: string): Promise<void> {
    if (text !== '') {
      await expect(this.items.filter({ hasText: text })).not.toHaveCount(0);
    }

    expect(await this.getWrappedElement().inputValue()).toEqual(text);
  }

  async expectedItemCount(count: number): Promise<void> {
    await expect(this.items).toHaveCount(count);
  }
}
