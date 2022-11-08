/*!
 * Copyright 2022 Tolam Earth
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {test, expect} from '@playwright/test';
import {esgSummary} from './__mocks__/esgsummary-mock-data.js';

test.describe('Marketplace page', () => {
  test.beforeEach(async ({page}) => {
    // Go to the starting url before each test.
    // Intercepting API request
    await page.route('**/simplesearch', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(esgSummary)
      });
    });

    await page.goto('/');
    await page.click('button:has-text("Buy offsets")');
  });

  test('Response page', async ({page}) => {
    expect(await page.$('.offsets-cell')).toBeDefined();
  });

  test('Select available assets', async ({page}) => {
    expect(page.locator('.table-title').first()).toContainText(
      'AVAILABLE OFFSETS'
    );

    expect(
      await page.isDisabled('button:has-text("Purchase Selected")')
    ).toBeTruthy();

    await page.check('input[type="checkbox"] >> nth=1');
    await page.check('input[type="checkbox"] >> nth=2');

    expect(
      await page.isEnabled('button:has-text("Purchase Selected")')
    ).toBeTruthy();

    await page.uncheck('input[type="checkbox"] >> nth=1');
    await page.uncheck('input[type="checkbox"] >> nth=2');

    expect(
      await page.isDisabled('button:has-text("Purchase Selected")')
    ).toBeTruthy();
  });
});
