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

import {expect, test} from '@playwright/test';
import {allMockData} from './__mocks__/mock-data.js';

test.describe('Account page', () => {
  test.beforeEach(async ({page}) => {
    // Go to the starting url before each test.
    // Intercepting API request
    await page.route(
      '**/offsets?account_id=0.0.2&list_state=ALL&limit=100',
      async route =>
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(allMockData)
        })
    );

    await page.goto('/');
    await page.fill('input', '0.0.2');
    await page.click('button:has-text("Sell")');
  });

  test('Response page', async ({page}) => {
    expect(await page.$('.offsets-cell')).toBeDefined();
  });

  test('Select unlisted assets', async ({page}) => {
    expect(page.locator('.table-title').first()).toContainText(
      'UNLISTED OFFSETS'
    );

    expect(
      await page.isDisabled('button:has-text("List Selected")')
    ).toBeTruthy();

    await page.check('input[type="checkbox"] >> nth=1');
    await page.check('input[type="checkbox"] >> nth=2');

    expect(
      await page.isEnabled('button:has-text("List Selected")')
    ).toBeTruthy();

    await page.uncheck('input[type="checkbox"] >> nth=1');
    await page.uncheck('input[type="checkbox"] >> nth=2');

    expect(
      await page.isDisabled('button:has-text("List Selected")')
    ).toBeTruthy();
  });
});
