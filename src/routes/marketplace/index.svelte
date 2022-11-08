<!--
Copyright 2022 Tolam Earth

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
<script lang="ts">
  import {browser} from '$app/env';
  import {goto} from '$app/navigation';
  import LayoutGrid, {Cell} from '@smui/layout-grid';
  import Card, {Content} from '@smui/card';
  import OffsetESGSummaryDataTable from '$lib/OffsetESGSummaryDataTable.svelte';
  import Button, {Label} from '@smui/button';
  import {marketplaceOffsetsStore, marketplaceSelectedStore} from '$store';
  import OffsetFilter from '$lib/OffsetFilter.svelte';
  import type {SimpleSearchRequest, SimpleSearchResponse} from '$types';
  import {getSimpleSearch} from '../../services';

  let error = '';
  let loadedUnlisted = true;

  const loadOffsetESGSummaries = async (
    opts = {forceRefresh: false},
    filters?: SimpleSearchRequest
  ) => {
    // Todo: Fix for the SMUI datatables state issue
    if (
      opts.forceRefresh ||
      !$marketplaceOffsetsStore.length ||
      $marketplaceSelectedStore.length === 0
    ) {
      const requestPayload = filters ? {...filters} : {};
      try {
        const responsePayload: SimpleSearchResponse = await getSimpleSearch(
          requestPayload
        );
        if (responsePayload) {
          marketplaceOffsetsStore.set(responsePayload.results);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  $: browser && loadOffsetESGSummaries();
</script>

<LayoutGrid>
  <Cell span={12}>
    <Card
      ><Content>
        <h2>Marketplace</h2>
      </Content>
    </Card>
  </Cell>
  {#if error}
    <Cell span={12}>
      <div class="error">{error}</div>
    </Cell>
  {:else}
    <Cell span={3}>
      <OffsetFilter
        shouldBeDisabled
        showMarketPlaceFilters
        on:filter={({detail: filterValue}) => {
          marketplaceSelectedStore.set([]);
          loadOffsetESGSummaries({forceRefresh: true}, filterValue);
        }}
        on:filter:reset={() => {
          marketplaceSelectedStore.set([]);
          loadOffsetESGSummaries({forceRefresh: true});
        }}
      />
    </Cell>
    <Cell span={9}>
      <OffsetESGSummaryDataTable
        offsets={$marketplaceOffsetsStore}
        bind:selectedOffsets={$marketplaceSelectedStore}
        loaded={loadedUnlisted}
        tableTitle="AVAILABLE OFFSETS"
        titleColor="#fc5130"
        shouldShowDetailedView={true}
        shouldShowPrice={true}
        hasSelectableAssets={true}
        on:sort={({detail: {offsets}}) => {
          marketplaceOffsetsStore.set(offsets);
        }}
      >
        <span slot="toolbar">
          <Button
            variant="raised"
            color="primary"
            disabled={!$marketplaceSelectedStore.length}
            on:click={() => goto(`/marketplace/checkout`, {replaceState: false})}
          >
            <Label>Purchase Selected</Label>
          </Button>
        </span>
      </OffsetESGSummaryDataTable>
    </Cell>
  {/if}
</LayoutGrid>

<style>
  .error {
    text-align: center;
    padding: 2rem;
    font-family: 'Roboto';
    font-size: 1.5rem;
  }
</style>
