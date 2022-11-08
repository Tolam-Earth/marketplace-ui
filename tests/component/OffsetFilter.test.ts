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

import {test, expect} from '@playwright/experimental-ct-svelte';
import OffsetFilter from '$lib/OffsetFilter.svelte';

test.describe('OffsetFilter', () => {
  test.describe('offset search text field', () => {
    test('has a search input', async ({mount}) => {
      const component = await mount(OffsetFilter);
      const control = component.locator('.mdc-text-field input[type="search"]');

      await expect(control).toBeVisible();
      await expect(control).toHaveValue('');
    });

    test('can be disabled', async ({mount}) => {
      const component = await mount(OffsetFilter, {
        props: {shouldBeDisabled: true}
      });
      const control = component.locator('.mdc-text-field input[type="search"]');

      await expect(control).toBeDisabled();
    });
  });

  test.describe('list type select menu', () => {
    test('has expected menu label', async ({mount}) => {
      const component = await mount(OffsetFilter);
      const pseudoControl = component.locator('.mdc-select');
      const label = pseudoControl.locator('label');

      await expect(label).toHaveText('Type');
    });

    test('controls are enabled by default', async ({mount}) => {
      const component = await mount(OffsetFilter);
      const pseudoControl = component.locator('.mdc-select', {
        hasText: 'Type'
      });
      const anchor = pseudoControl.locator('.mdc-select__anchor');

      await expect(anchor).toHaveAttribute('aria-disabled', 'false');
      await expect(anchor).toHaveAttribute('tabindex', '0');
    });

    test('controls can be disabled', async ({mount}) => {
      const component = await mount(OffsetFilter, {
        props: {shouldBeDisabled: true}
      });
      const pseudoControl = component.locator('.mdc-select', {
        hasText: 'Type'
      });
      const anchor = pseudoControl.locator('.mdc-select__anchor');

      await expect(anchor).toHaveAttribute('aria-disabled', 'true');
      await expect(anchor).not.toHaveAttribute('tabindex', '0');
    });

    test('defaults to show all account listing types', async ({mount}) => {
      const component = await mount(OffsetFilter);
      const pseudoControl = component.locator('.mdc-select', {
        hasText: 'Type'
      });
      const listbox = pseudoControl.locator('[role="listbox"]');
      const selectedOption = listbox.locator('[aria-selected="true"]');

      await expect(selectedOption).toHaveText('ALL');
    });
  });

  test.describe('Search Filters', () => {
    test('conditionally shows search filters', async ({mount}) => {
      const component = await mount(OffsetFilter, {
        props: {
          showMarketPlaceFilters: true,
          shouldBeDisabled: true
        }
      });
      const pseudoControl = component.locator('.mdc-select', {
        hasText: 'Project Category'
      });
      const anchor = pseudoControl.locator('.mdc-select__anchor');

      await expect(pseudoControl).toBeVisible();
      await expect(anchor).toHaveAttribute('aria-disabled', 'false');
    });

    test('project category defaults to "None" option', async ({mount}) => {
      const component = await mount(OffsetFilter, {
        props: {showMarketPlaceFilters: true}
      });
      const pseudoControl = component.locator('.mdc-select', {
        hasText: 'Project Category'
      });
      const listbox = pseudoControl.locator('[role="listbox"]');
      const selectedOption = listbox.locator('[aria-selected="true"]');

      await expect(selectedOption).toHaveText('None');
    });
  });
});
