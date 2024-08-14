import { test, expect } from '@playwright/test';
import { SelectTestSuit } from '../select-test-suit';

const { describe, beforeEach } = test;
describe.configure({ mode: 'parallel' });
// describe.configure({ mode: 'serial' });

const testUrl = '/test/select-multiple/index.html';
