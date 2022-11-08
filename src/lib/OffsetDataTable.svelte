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
  import type {Offset, OffsetESGSummary} from '$types';
  import DataTable, {
    Head,
    Body,
    Row,
    Cell,
    Pagination,
    SortValue
  } from '@smui/data-table';
  import Checkbox from '@smui/checkbox';
  import LinearProgress from '@smui/linear-progress';
  import Select, {Option} from '@smui/select';
  import IconButton from '@smui/icon-button';
  import {Label} from '@smui/common';
  import Card, {Content} from '@smui/card';
  import get from 'lodash/get.js';

  import {formatCurrency} from '$utils';

  import type {NFT} from '$types';
  import {createEventDispatcher} from 'svelte';
  import EsgDetailModal from './ESGDetailModal.svelte';

  export let tableTitle: string;
  export let titleColor = 'initial';
  export let loaded = true;
  export let shouldShowPrice = false;
  export let shouldShowDetailedView = false;
  export let hasSelectableAssets = false;
  export let offsets: Offset[];
  export let selectedOffsets: Offset[] = null;

  // Sort
  let sort: keyof NFT = 'token_id';
  let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';

  // Pagination
  let rowsPerPage = 10;
  let currentPage = 0;
  $: start = currentPage * rowsPerPage;
  $: end = Math.min(start + rowsPerPage, offsets.length);
  $: lastPage = Math.max(Math.ceil(offsets.length / rowsPerPage) - 1, 0);
  $: slicedOffsets = offsets.slice(start, end);
  $: if (currentPage > lastPage) {
    currentPage = lastPage;
  }

  const dispatch = createEventDispatcher();

  function handleSort() {
    const sortedOffsets = offsets.sort((a, b) => {
      const [aVal, bVal] = [get(a, sort), get(b, sort)][
        sortDirection === 'ascending' ? 'slice' : 'reverse'
      ]();
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal);
      }
      return Number(aVal) - Number(bVal);
    });
    offsets = sortedOffsets;
    dispatch('sort', {offsets});
  }
</script>

<Card style="margin-top:1rem">
  <Content style="background-color: #f8f3f8">
    <div class="title-header">
      <h6 class="table-title" style="color: {titleColor}">{tableTitle}</h6>
      <slot name="toolbar" />
    </div>
    <DataTable
      sortable
      bind:sort
      bind:sortDirection
      on:SMUIDataTable:sorted={handleSort}
      stickyHeader
      table$aria-label="Available offsets"
      style="width: 100%;"
    >
      <Head>
        <Row>
          {#if hasSelectableAssets}
            <Cell checkbox>
              <Checkbox
                disabled={hasSelectableAssets && offsets.length === 0}
              />
            </Cell>
          {/if}
          <Cell columnId="nft.token_id">
            <Label>Offset ID</Label>
            <IconButton class="material-icons">arrow_upward</IconButton>
          </Cell>
          {#if shouldShowPrice}
            <Cell columnId="nft.price">
              <Label>Price</Label>
              <IconButton class="material-icons">arrow_upward</IconButton>
            </Cell>
          {/if}
          <Cell columnId="owner_id">
            <Label>{shouldShowPrice ? 'Seller ID' : 'Owner ID'}</Label>
            <IconButton class="material-icons">arrow_upward</IconButton>
          </Cell>
        </Row>
      </Head>
      <Body>
        {#if Array.isArray(slicedOffsets) && slicedOffsets.length > 0}
          {#each slicedOffsets as item, i (item.nft.token_id + item.nft.serial_number + i)}
            {@const offsetId = `${item.nft.token_id} (${item.nft.serial_number})`}
            <Row>
              {#if hasSelectableAssets}
                <Cell checkbox>
                  <Checkbox
                    bind:group={selectedOffsets}
                    value={item}
                    valueKey={item.nft.token_id}
                  />
                </Cell>
              {/if}
              <Cell style="font-size: 1rem" class="offsets-cell">
                {#if shouldShowDetailedView}
                  {offsetId}
                  <EsgDetailModal
                    tokenId={item.nft.token_id}
                    serialNumber={item.nft.serial_number}
                  />
                {:else}
                  {offsetId}
                {/if}
              </Cell>
              {#if shouldShowPrice}
                <Cell style="font-size: 1rem" class="offsets-cell">
                  {#if item.price}
                    {formatCurrency(item.price)}
                  {:else}
                    —
                  {/if}
                </Cell>
              {/if}
              <Cell style="font-size: 1rem" class="offsets-cell">
                {item.owner_id}
              </Cell>
            </Row>
          {/each}
        {:else}
          {#if hasSelectableAssets}
            <Cell />
          {/if}
          <Cell colspan={shouldShowPrice ? '3' : '2'}>
            <div class="no-offsets">No Offsets found.</div>
          </Cell>
        {/if}
      </Body>

      <LinearProgress
        indeterminate
        bind:closed={loaded}
        aria-label="Data is being loaded..."
        slot="progress"
      />

      <Pagination slot="paginate">
        <svelte:fragment slot="rowsPerPage">
          <Label>Rows Per Page</Label>
          <Select variant="outlined" bind:value={rowsPerPage} noLabel>
            <Option value={10}>10</Option>
            <Option value={25}>25</Option>
            <Option value={50}>50</Option>
          </Select>
        </svelte:fragment>
        <svelte:fragment slot="total">
          {start + 1}-{end} of {offsets.length}
        </svelte:fragment>

        <IconButton
          class="material-icons"
          action="first-page"
          title="First page"
          on:click={() => (currentPage = 0)}
          disabled={currentPage === 0}>first_page</IconButton
        >
        <IconButton
          class="material-icons"
          action="prev-page"
          title="Prev page"
          on:click={() => currentPage--}
          disabled={currentPage === 0}>chevron_left</IconButton
        >
        <IconButton
          class="material-icons"
          action="next-page"
          title="Next page"
          on:click={() => currentPage++}
          disabled={currentPage === lastPage}>chevron_right</IconButton
        >
        <IconButton
          class="material-icons"
          action="last-page"
          title="Last page"
          on:click={() => (currentPage = lastPage)}
          disabled={currentPage === lastPage}>last_page</IconButton
        >
      </Pagination>
    </DataTable>
  </Content>
</Card>

<style lang="scss">
  .table-title {
    margin: 0 0 1rem 0.5rem;
    text-decoration: underline;
    text-underline-offset: 11px;
  }

  .no-offsets {
    text-align: center;
    padding: 2rem;
    font-family: 'Roboto';
    font-size: 1rem;
  }

  .title-header {
    display: flex;
    justify-content: space-between;
  }
</style>
