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
  import {onDestroy, onMount} from 'svelte';
  import findIndex from 'lodash/findIndex';
  import {page} from '$app/stores';
  import {goto} from '$app/navigation';
  import {browser} from '$app/env';
  import LayoutGrid, {Cell} from '@smui/layout-grid';
  import Card, {Content} from '@smui/card';
  import Button, {Label} from '@smui/button';
  import OffsetDataTable from '$lib/OffsetDataTable.svelte';
  import TransactionStatus from '$lib/TransactionStatus.svelte';
  import {
    accountIdStore,
    listTypeStore,
    unlistedOffsetsStore,
    listedOffsetsStore,
    unlistSelectedStore,
    transactionsStore
  } from '$store';
  import OffsetFilter from '$lib/OffsetFilter.svelte';
  import {getTransactionDetails} from './../../services';

  import type {Offset, Account, Transaction, TransactionResponse} from '$types';
  import {getOffsets} from '../../services';

  let error = '';
  let loadedUnlisted = true;
  let loadedListed = true;
  let transactionIntervalId: NodeJS.Timer;
  const transactionIntervalSeconds = 5000;

  onMount(async () => {
    !$accountIdStore && goto('/');

    loadTransactionStatus($transactionsStore);

    transactionIntervalId = setInterval(() => {
      loadTransactionStatus($transactionsStore);
    }, transactionIntervalSeconds);
  });

  onDestroy(() => {
    clearInterval(transactionIntervalId);
  });

  const loadOffsets = async () => {
    try {
      const account: Account = await getOffsets($accountIdStore, 'ALL');
      if (account && account.offsets) {
        const unlistedOffsetsResponse: Offset[] = account.offsets
          .filter(os => os.list_state === 'UNLISTED')
          .map(os => os.offset);

        const listedOffsetsResponse: Offset[] = account.offsets
          .filter(os => os.list_state === 'LISTED')
          .map(os => os.offset);

        unlistedOffsetsStore.set(unlistedOffsetsResponse);
        listedOffsetsStore.set(listedOffsetsResponse);
      }
    } catch (e) {
      if (typeof e === 'string') {
        error = e;
      } else {
        error = 'There was an issue fetching the offsets, please try again.';
      }
    }
  };

  async function loadAllOffsets(account: string) {
    if (!account) return;

    // Todo: Current workaround for the SMUI datatable rerender issue
    if (
      !$unlistedOffsetsStore.length ||
      $unlistedOffsetsStore[0].owner_id !== account ||
      $unlistSelectedStore.length === 0
    ) {
      loadedUnlisted = false;
      loadedListed = false;
      unlistSelectedStore.set([]);
      unlistedOffsetsStore.set([]);
      listedOffsetsStore.set([]);
      try {
        await loadOffsets();
      } catch (error) {
        console.log(error); // Todo: Add error message
      } finally {
        loadedUnlisted = true;
        loadedListed = true;
      }
    }
  }

  async function loadTransactionStatus(transactions: Transaction[]) {
    transactions.map(async transaction => {
      if (!['LISTED', 'PURCHASED'].includes(transaction.status)) {
        const transactionStatus: TransactionResponse =
          await getTransactionDetails(
            transaction.transactionId,
            transaction.type
          );

        if (transactionStatus && transactionStatus.state) {
          const currentTransactionStatus = transactionStatus.state;

          if (['LISTED', 'PURCHASED'].includes(currentTransactionStatus)) {
            await loadAllOffsets($accountIdStore);
          }

          transactionsStore.update(ts => {
            const index = findIndex(
              ts,
              (t: Transaction) => t.transactionId === transaction.transactionId
            );
            ts[index].status = currentTransactionStatus;
            return ts;
          });
        }
      }
    });
  }

  $: loadAllOffsets($accountIdStore);
  $: searchValue = browser && new URLSearchParams($page.url.search).get('s');
</script>

<LayoutGrid>
  <Cell span={12}>
    <Card
      ><Content>
        <h2>Account ID: {$accountIdStore}</h2></Content
      >
    </Card>
  </Cell>

  {#if error}
    <Cell span={12}>
      <div class="error">{error}</div>
    </Cell>
  {:else}
    <Cell span={3}>
      <OffsetFilter
        selectedListType={$listTypeStore}
        bind:searchValue
        on:filter={({detail}) => listTypeStore.set(detail)}
        on:search={({detail}) => {
          searchValue = detail.get('s');
          goto(`/account/tx/${searchValue}`, {replaceState: true});
        }}
      />
    </Cell>
    <Cell span={9}>
      <TransactionStatus />
      {#if $listTypeStore === 'UNLISTED' || $listTypeStore === 'ALL'}
        <OffsetDataTable
          offsets={$unlistedOffsetsStore}
          bind:selectedOffsets={$unlistSelectedStore}
          loaded={loadedUnlisted}
          titleColor="#fc5130"
          tableTitle="UNLISTED OFFSETS"
          hasSelectableAssets={true}
          on:sort={({detail: {offsets}}) => {
            unlistedOffsetsStore.set(offsets);
          }}
        >
          <span slot="toolbar">
            <Button
              variant="raised"
              color="primary"
              disabled={!$unlistSelectedStore.length}
              on:click={() => goto(`/account/review`, {replaceState: false})}
            >
              <Label>List Selected</Label>
            </Button>
          </span>
        </OffsetDataTable>
      {/if}
      {#if $listTypeStore === 'LISTED' || $listTypeStore === 'ALL'}
        <OffsetDataTable
          offsets={$listedOffsetsStore}
          loaded={loadedListed}
          tableTitle="LISTED OFFSETS"
          titleColor="#2484ff"
          hasSelectableAssets={false}
          shouldShowPrice={true}
          on:sort={({detail: {offsets}}) => {
            listedOffsetsStore.set(offsets);
          }}
        />
      {/if}
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
