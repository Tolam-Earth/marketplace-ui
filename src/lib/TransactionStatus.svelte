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
  import type {Transaction} from '$types';
  import Paper from '@smui/paper';
  import TabBar from '@smui/tab-bar';
  import Tab, {Icon, Label} from '@smui/tab';
  import {transactionsStore} from '$store';
  import TransactionDataTable from './TransactionDataTable.svelte';
  import {onMount} from 'svelte';
  import {page} from '$app/stores';
  import {encodeHashScanId} from '$utils';

  interface TransactionStatusTab {
    icon: string;
    label: string;
  }

  const tabs: TransactionStatusTab[] = [
    {
      icon: 'output',
      label: 'Recent listings'
    },
    {
      icon: 'add_card',
      label: 'Recent purchases'
    }
  ];
  let activeTab = tabs[0];

  $: selected = [...listings, ...purchases].find(
    (item: Transaction) =>
      encodeHashScanId(item.transactionId) ===
      new URLSearchParams($page.url.search).get('s')
  );

  $: listings = $transactionsStore.filter(
    (item: Transaction) => item.type === 'LIST'
  );

  $: purchases = $transactionsStore.filter(
    (item: Transaction) => item.type === 'PURCHASE'
  );

  onMount(() => {
    if (purchases.includes(selected)) {
      activeTab = tabs[1];
    }
  });
</script>

<Paper style="margin: 1rem 0 2rem 0; background-color: #f8f3f8">
  <TabBar
    {tabs}
    let:tab
    bind:active={activeTab}
    style="margin-bottom: 1rem; margin-top: -0.5rem;"
  >
    <Tab {tab}>
      <Icon class="material-icons">{tab.icon}</Icon>
      <Label>{tab.label}</Label>
    </Tab>
  </TabBar>

  {#if activeTab.label === 'Recent listings'}
    <TransactionDataTable transactions={listings} {selected}>
      <svelte:fragment slot="no-data">
        <p>
          No listings recorded this session. Select assets to be listed below.
        </p>
      </svelte:fragment>
    </TransactionDataTable>
  {:else}
    <TransactionDataTable transactions={purchases} {selected}>
      <svelte:fragment slot="no-data">
        <p>
          No purchases recorded this session. <a href="/marketplace"
            >Purchase offsets</a
          >.
        </p>
      </svelte:fragment>
    </TransactionDataTable>
  {/if}
</Paper>
