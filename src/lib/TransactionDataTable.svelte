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
  import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
  import CircularProgress from '@smui/circular-progress';
  import {fade} from 'svelte/transition';
  import {formatHashScanTxLookupUri} from '$utils';

  import {ListingStatusMap, PurchaseStatusMap, type Transaction} from '$types';

  export let transactions: Transaction[];
  export let selected: Transaction | null = null;

  const isStatusActive = (status: string, type: string, step: number) => {
    return type === 'LIST'
      ? ListingStatusMap[status] >= step
      : PurchaseStatusMap[status] >= step;
  };
</script>

<DataTable table$aria-label="Transaction status" style="width: 100%;">
  <Head>
    <Row>
      <Cell>Transaction ID</Cell>
      <Cell style="width: 100%; text-align: center">Status</Cell>
    </Row>
  </Head>
  <Body>
    {#if transactions.length === 0}
      <Row>
        <Cell colspan={2}>
          <div class="empty-cell">
            <slot name="no-data" />
          </div>
        </Cell>
      </Row>
    {/if}
    {#each transactions as { transactionId, status, type } (transactionId)}
      <Row>
        <Cell style="font-size: 1rem">
          {#if transactionId === selected?.transactionId}
            <mark>
              <a
                target="HashScan"
                rel="external noopener noreferrer"
                href={formatHashScanTxLookupUri(transactionId)}
              >
                {transactionId}
              </a>
            </mark>
          {:else}
            <a
              target="HashScan"
              rel="external noopener noreferrer"
              href={formatHashScanTxLookupUri(transactionId)}
            >
              {transactionId}
            </a>
          {/if}
          <i
            class="material-icons"
            style="font-size:medium; vertical-align:text-top; color:#676778"
            aria-hidden="true">open_in_new</i
          >
        </Cell>
        <Cell style="text-align: center">
          <div class="container">
            <ul class="progressbar">
              <li data-step="✔" class:active={isStatusActive(status, type, 1)}>
                Initiated
              </li>
              {#if type === 'LIST' && status !== 'LISTED'}
                <li data-step="-" class:active={true}>
                  <CircularProgress
                    style="height: 40px; width: 40px; bottom:47px; left: 20px; background-color: #fffaff; border-radius: 50%"
                    indeterminate
                    color="orange"
                  />
                  <span style="position:relative; bottom: 22px; right: 21px"
                    >Listed</span
                  >
                </li>
              {:else if type === 'PURCHASE' && status !== 'PURCHASED'}
                <li data-step="-" class:active={true}>
                  <CircularProgress
                    style="height: 40px; width: 40px; bottom:47px; left: 35px; background-color: #fffaff; border-radius: 50%"
                    indeterminate
                    color="orange"
                  />
                  <span style="position:relative; bottom: 22px; right: 21px"
                    >Purchased</span
                  >
                </li>
              {:else if type === 'LIST' && status === 'LISTED'}
                <li
                  data-step={isStatusActive(status, type, 3) ? '✔' : '-'}
                  class:active={isStatusActive(status, type, 3)}
                  in:fade
                >
                  Listed
                </li>
              {:else if type === 'PURCHASE' && status === 'PURCHASED'}
                <li
                  data-step={isStatusActive(status, type, 3) ? '✔' : '-'}
                  class:active={isStatusActive(status, type, 3)}
                  in:fade
                >
                  Purchased
                </li>
              {/if}
            </ul>
          </div>
        </Cell>
      </Row>
    {/each}
  </Body>
</DataTable>

<style lang="scss">
  .container {
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .progressbar li {
    float: left;
    width: 50%;
    position: relative;
    text-align: center;
    list-style: none;
  }

  .progressbar {
    display: flex;
    justify-content: center;
    height: 66px;
  }

  .progressbar li:before {
    content: '' attr(data-step) '';
    width: 30px;
    border: 2px solid #bebebe;
    display: block;
    margin: 0 auto 10px auto;
    border-radius: 50%;
    line-height: 27px;
    background: white;
    color: #bebebe;
    text-align: center;
    font-weight: bold;
  }

  .progressbar li:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 3px;
    background: #979797;
    top: 15px;
    left: -50%;
    z-index: -1;
  }

  .progressbar li:first-child:after {
    content: none;
  }

  .progressbar li.active:after {
    background: #53c576;
  }

  .progressbar li.active:before {
    border-color: #53c576;
    background: #53c576;
    color: white;
  }

  .empty-cell {
    display: flex;
    height: 94px;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }
</style>
