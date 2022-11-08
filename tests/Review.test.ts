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
import {allMockData, priceRangeMockData} from './__mocks__/mock-data.js';

test.describe('Review page', () => {
  test.beforeEach(async ({page}) => {
    await page.route(
      '**/offsets?account_id=0.0.2&list_state=ALL&limit=100',
      async route =>
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(allMockData)
        })
    );

    await page.route(
      '**/offsets?account_id=0.0.2&list_state=ALL&limit=100',
      async route =>
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(allMockData)
        })
    );

    await page.route(
      '**/price',
      async route =>
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(priceRangeMockData)
        })
    );

    await page.goto('/');
    await page.fill('input', '0.0.2');
    await page.click('button:has-text("Sell")');
  });

  test('Select unlisted assets and move to review page', async ({page}) => {
    await page.check('input[type="checkbox"] >> nth=1');
    await page.check('input[type="checkbox"] >> nth=2');

    await page.click('button:has-text("List Selected")');
    expect(await page.textContent('text=0.0.2220290')).toBeTruthy();
    expect(await page.textContent('text=0.0.2220220')).toBeTruthy();
  });

  test('Cancel and go back', async ({page}) => {
    await page.check('input[type="checkbox"] >> nth=1');
    await page.check('input[type="checkbox"] >> nth=2');

    await page.click('button:has-text("List Selected")');
    expect(await page.textContent('text=0.0.2220290')).toBeTruthy();
    expect(await page.textContent('text=0.0.2220220')).toBeTruthy();
    await page.click('button:has-text("Cancel and Go back")');
    expect(await page.$('input[type="checkbox"] >> nth=1')).toBeTruthy();
  });

  test('Update the price field and persist it on the route change.', async ({
    page
  }) => {
    await page.check('input[type="checkbox"] >> nth=1');

    await page.click('button:has-text("List Selected")');
    await page.fill('input', '3');
    await page.click('button:has-text("Cancel and Go back")');
    await page.click('button:has-text("List Selected")');

    expect(await (await page.$('input[type="number"]')).inputValue()).toBe('3');
  });

  test.skip('Autofill using "Use Max/Min" buttons.', async ({page}) => {
    await page.check('input[type="checkbox"] >> nth=1');
    await page.check('input[type="checkbox"] >> nth=2');

    await page.click('button:has-text("List Selected")');
    expect(await page.textContent('text=0.0.2220290')).toBeTruthy();
    expect(await page.textContent('text=0.0.2220220')).toBeTruthy();

    const useMaxButton = page.locator('button:has-text("Use Max")');
    const useMinButton = page.locator('button:has-text("Use Min")');

    const firstRow = page.locator('tr:has-text("0.0.2220290")');
    const firstPriceInput = firstRow.locator('input[type="number"]');
    const firstPriceRange = firstRow.locator('td >> nth=2');
    const secondRow = page.locator('tr:has-text("0.0.2220220")');
    const secondPriceInput = secondRow.locator('input[type="number"]');
    const secondPriceRange = secondRow.locator('td >> nth=2');

    expect(await firstPriceRange.textContent()).toBe('$0.63 - $0.68');
    expect(await secondPriceRange.textContent()).toBe('$0.35 - $0.38');

    expect(await firstPriceInput.inputValue()).toBe('');
    expect(await secondPriceInput.inputValue()).toBe('');
    await useMaxButton.click();
    expect(await firstPriceInput.inputValue()).toBe('0.68');
    expect(await secondPriceInput.inputValue()).toBe('0.38');

    await useMinButton.click();
    expect(await firstPriceInput.inputValue()).toBe('0.63');
    expect(await secondPriceInput.inputValue()).toBe('0.35');
  });
});
