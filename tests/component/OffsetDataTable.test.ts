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
import OffsetDataTable from '$lib/OffsetDataTable.svelte';
import {purchasableOffsets} from '../__mocks__/marketplace-mock-data.js';

import type {Offset} from '$types';

const availableOffsets: Offset[] = purchasableOffsets.offsets
  .filter(os => os.list_state === 'LISTED')
  .map(os => os.offset);

test.describe('OffsetDataTable', () => {
  test('has customizable title', async ({mount}) => {
    const component = await mount(OffsetDataTable, {
      slots: {
        toolbar: '<div>Toolbar</div>'
      },
      props: {
        tableTitle: 'Specific title',
        offsets: [],
        selectedOffsets: [],
        shouldShowPrice: false
      }
    });

    await expect(component).toContainText('Specific title');
    await expect(component).not.toContainText('Test table');
  });

  test('can select all visible assets', async ({mount}) => {
    const component = await mount(OffsetDataTable, {
      slots: {
        toolbar: '<div>Specific content</div>'
      },
      props: {
        tableTitle: 'Test table',
        offsets: availableOffsets,
        selectedOffsets: [],
        hasSelectableAssets: true,
        shouldShowPrice: false
      }
    });

    // TODO: Recenter locators around the table row level to check aria attributes

    const selectAllCheckbox = component.locator(
      'th[role="columnheader"] input[type="checkbox"]'
    );
    expect(selectAllCheckbox).not.toBeChecked();

    const assetCheckboxes = component.locator('tbody input[type="checkbox"]');
    const numAssetCheckboxes = await assetCheckboxes.count();

    // we should have the same number of checkboxes as assets
    expect(numAssetCheckboxes).toBe(availableOffsets.length);

    // all asset checkboxes are unchecked by default
    for (let i = 0; i < numAssetCheckboxes; i++) {
      await expect(assetCheckboxes.nth(i)).not.toBeChecked();
    }

    // click select all checkbox
    await selectAllCheckbox.check();
    await expect(selectAllCheckbox).toBeChecked();

    // all asset checkboxes are checked
    for (let i = 0; i < numAssetCheckboxes; i++) {
      await expect(assetCheckboxes.nth(i)).toBeChecked();
    }
  });

  test('can show prices', async ({mount}) => {
    const component = await mount(OffsetDataTable, {
      slots: {
        toolbar: '<div>Toolbar</div>'
      },
      props: {
        tableTitle: 'Test table',
        offsets: availableOffsets,
        selectedOffsets: [],
        shouldShowPrice: true
      }
    });

    await expect(component).toContainText('Price');
  });

  test('can hide prices', async ({mount}) => {
    const component = await mount(OffsetDataTable, {
      slots: {
        toolbar: '<div>Toolbar</div>'
      },
      props: {
        tableTitle: 'Test table',
        offsets: availableOffsets,
        selectedOffsets: [],
        shouldShowPrice: false
      }
    });

    await expect(component).not.toContainText('Price');
  });
});
