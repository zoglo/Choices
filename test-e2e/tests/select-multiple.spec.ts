import { test, expect } from '@playwright/test';
import { SelectTestSuit } from '../select-test-suit';

const { describe } = test;
describe.configure({ mode: 'serial', retries: 0 });

const testUrl = '/test/select-multiple/index.html';
SelectTestSuit.testBundles().forEach(({ name, bundle }) => {
  describe(`Choices - select multiple ${name}`, () => {
    describe('scenarios', () => {

    });
  });
});
