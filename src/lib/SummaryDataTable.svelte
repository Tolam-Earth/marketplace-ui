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
  import {createEventDispatcher} from 'svelte';
  import Card, {Content} from '@smui/card';
  import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
  import {Label} from '@smui/common';
  import IconButton from '@smui/icon-button';
  import Textfield from '@smui/textfield';
  import TextfieldIcon from '@smui/textfield/icon';
  import {offsetPriceRangeForId} from '$utils';
  import {unlistSelectedStore} from '$store';
  import type {OffsetPriceRange} from '$types';

  export let offsetPriceRanges: OffsetPriceRange[] = [];

  const dispatch = createEventDispatcher();
</script>

<Card style="margin: 3rem">
  <Content style="background-color: #f8f3f8">
    <div class="title-header">
      <h6 class="table-title">SUMMARY</h6>
      <slot name="toolbar" />
    </div>
    <DataTable
      stickyHeader
      table$aria-label="Summary of selected offsets"
      style="width: 100%;"
    >
      <Head>
        <Row>
          <Cell style="width:100%" columnId="nft.token_id">
            <Label>Offset ID</Label>
          </Cell>
          <Cell style="width:100%" columnId="owner_id">
            <Label>Owner ID</Label>
          </Cell>
          <Cell style="width:100%" columnId="price_range">
            <Label>Recommended Price</Label>
          </Cell>
          <Cell style="width:100%" columnId="price">
            <Label>Price</Label>
          </Cell>
          <Cell style="width:100%">
            <Label />
          </Cell>
        </Row>
      </Head>
      <Body>
        {#if $unlistSelectedStore.length}
          {#each $unlistSelectedStore as offset (offset.nft.token_id + offset.nft.serial_number)}
            {@const offsetId = `${offset.nft.token_id} (${offset.nft.serial_number})`}
            <Row>
              <Cell style="font-size: 1rem">{offsetId}</Cell>
              <Cell style="font-size: 1rem" numeric>{offset.owner_id}</Cell>
              <Cell style="font-size: 1rem" numeric>
                {#each offsetPriceRanges as priceRange (priceRange.nft_id)}
                  {#if priceRange.nft_id.token_id === offset.nft.token_id}
                    {offsetPriceRangeForId(
                      offset.nft.token_id,
                      offsetPriceRanges
                    )}
                  {/if}
                {/each}
              </Cell>
              <Cell>
                <Textfield
                  bind:value={offset.price}
                  required
                  type="number"
                  input$min="0"
                  style="width: 6rem"
                >
                  <TextfieldIcon class="material-icons" slot="leadingIcon"
                    >attach_money</TextfieldIcon
                  >
                </Textfield>
              </Cell>
              <Cell numeric>
                <IconButton
                  on:click={() => dispatch('deselect', {offset})}
                  class="material-icons"
                  aria-label="Remove offset"
                  style="color: #676778">delete</IconButton
                >
              </Cell>
            </Row>
          {/each}
        {:else}
          <Cell colspan={5}>
            <p class="no-offsets">
              No offsets selected. Please select some offsets to see a summary.
            </p>
          </Cell>
        {/if}
      </Body>
    </DataTable>
    <div class="footer">
      <slot name="footer" />
    </div>
  </Content>
</Card>

<style lang="scss">
  .table-title {
    margin: 0 0 1rem 0.5rem;
    text-decoration: underline;
    text-underline-offset: 11px;
  }

  .title-header {
    display: flex;
    justify-content: space-between;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
  }

  .no-offsets {
    text-align: center;
    padding: 2rem;
    font-family: 'Roboto';
    font-size: 1rem;
  }
</style>
