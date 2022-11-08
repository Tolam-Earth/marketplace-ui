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
  import {onMount} from 'svelte';
  import {goto} from '$app/navigation';
  import {
    ContractExecuteTransaction,
    ContractFunctionParameters,
    AccountId,
    ContractId,
    Hbar
  } from '@hashgraph/sdk';
  import type {Transaction} from '@hashgraph/sdk';
  import {Icon} from '@smui/common';
  import type {SnackbarComponentDev} from '@smui/snackbar';
  import CircularProgress from '@smui/circular-progress';
  import Snackbar, {
    Actions as SnackbarActions,
    Label as SnackbarLabel
  } from '@smui/snackbar';
  import IconButton from '@smui/icon-button';
  import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
  import {Label} from '@smui/common';
  import Card, {Content} from '@smui/card';
  import Button, {Label as ButtonLabel} from '@smui/button';
  import Dialog, {Title, Content as DialogContent, Actions} from '@smui/dialog';
  import {
    hashpackWalletStore,
    hashconnectStore,
    accountIdStore,
    marketplaceSelectedStore,
    transactionsStore
  } from '$store';
  import type {ConversionRateResponse, OffsetPriceRange, Offset} from '$types';
  import {
    formatCurrency,
    formatNFTsToSolidity,
    offsetPriceRangeForId,
    loadOffsetPriceRanges
  } from '$utils';
  import envVariables from '$environment';

  import type {TransactionId} from '@hashgraph/sdk/lib/Signer';
  import type {HashConnectSigner} from 'hashconnect/dist/provider/signer';
  import type {HashConnectProvider} from 'hashconnect/dist/provider/provider';
  import sum from 'lodash/sum';
  import {getConversion, purchaseOffsets} from '../../../services';

  let loading = false;
  let snackbar: SnackbarComponentDev;
  let snackbarText = '';
  let finalDialogOpen = false;
  let confirmationDialogOpen = false;
  let transactionId: TransactionId;

  export let offsetPriceRanges: OffsetPriceRange[] = [];

  $: walletConnected = $hashpackWalletStore.pairedWalletData;

  const goToAccount = () => {
    goto(`/account/tx/${transactionId}`, {replaceState: false});
  };

  const goToMarketplace = () => {
    goto(`/marketplace`, {replaceState: false});
  };

  const onConfirmation = () => {
    goToAccount();
  };

  const deselectOffset = (deselected: Offset) => {
    marketplaceSelectedStore.update(offsets => {
      return offsets.filter(
        existing =>
          existing.nft.token_id !== deselected.nft.token_id ||
          existing.nft.serial_number !== deselected.nft.serial_number
      );
    });
  };

  const triggerSnackbar = (message: string) => {
    snackbarText = message;
    snackbar && snackbar.open();
  };

  const loadConversionRate = async () => {
    const {rate}: ConversionRateResponse = await getConversion(
      'TinybarToCents'
    );
    if (rate && rate > 0) {
      return rate;
    } else {
      throw new Error('Invalid conversion rate.');
    }
  };

  const executeTheContract = async (
    transaction: Transaction,
    signer: HashConnectSigner
  ) => {
    const smartContractResponse = await transaction.executeWithSigner(signer);

    if (smartContractResponse) {
      transactionId = smartContractResponse.transactionId;
      marketplaceSelectedStore.set([]);
      transactionsStore.update((transactions: Transaction[]) => [
        ...transactions,
        {
          transactionId,
          status: 'PENDING',
          type: 'PURCHASE'
        }
      ]);

      confirmationDialogOpen = true;
    } else {
      triggerSnackbar(
        'There was an issue signing the contract. Please try again or contact the admin.'
      );
    }
  };

  const whiteListAndExecuteSmartContract = async (
    transaction: Transaction,
    signer: HashConnectSigner
  ) => {
    const whitelistBody = {
      txn_id: transaction.transactionId.toString(),
      account_id: $accountIdStore,
      nfts: $marketplaceSelectedStore.map(offset => offset.nft)
    };

    const whitelistResponse = await purchaseOffsets(whitelistBody);

    if (whitelistResponse && whitelistResponse.request?.txn_id) {
      await executeTheContract(transaction, signer);
    } else {
      triggerSnackbar(
        'There was an issue finalizing the offsets. Please try again or contact the admin.'
      );

      return;
    }
  };

  const onFinalizePurchase = async () => {
    const hederaEnv: string = envVariables.hederaEnv;
    const smartContractId: string = envVariables.smartContractId;
    const topic: string = $hashpackWalletStore.connectionState.topic;
    const accountIDSolidity: string =
      AccountId.fromString($accountIdStore).toSolidityAddress();

    const provider: HashConnectProvider = $hashconnectStore.getProvider(
      hederaEnv,
      topic,
      $accountIdStore
    );
    const signer: HashConnectSigner = $hashconnectStore.getSigner(provider);

    const formattedNFTs = formatNFTsToSolidity(
      $marketplaceSelectedStore,
      false
    );

    try {
      const conversionRate = await loadConversionRate();
      const payablePriceInTinybar = Math.round(
        sum(formattedNFTs.prices) * conversionRate
      );

      const transaction: Transaction = await new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartContractId))
        .setFunction(
          'purchase_offset',
          new ContractFunctionParameters()
            .addAddress(accountIDSolidity)
            .addAddressArray(formattedNFTs.tokenIds)
            .addInt64Array(formattedNFTs.serialIds)
        )
        .setPayableAmount(Hbar.fromTinybars(payablePriceInTinybar))
        .setGas(1000000)
        .freezeWithSigner(signer);

      await whiteListAndExecuteSmartContract(transaction, signer);
    } catch (error) {
      console.error(error);
      triggerSnackbar(
        'There was a problem finalizing your purchase. Please try again or contact the admin.'
      );
    }
  };

  const hashpackWalletStoreUpdate = (data, name: string) => {
    hashpackWalletStore.update(store => {
      return {
        ...store,
        [name]: data
      };
    });
  };

  async function connectWallet() {
    if (!$hashpackWalletStore.pairingString) {
      const pairingString = $hashconnectStore.generatePairingString(
        $hashpackWalletStore.connectionState,
        'testnet',
        false
      );
      hashpackWalletStoreUpdate(pairingString, 'pairingString');
    }

    $hashconnectStore.findLocalWallets();
    $hashconnectStore.connectToLocalWallet($hashpackWalletStore.pairingString);

    $hashconnectStore.pairingEvent.once(pairingData => {
      accountIdStore.set(pairingData.accountIds[0]);
      hashpackWalletStore.update(data => {
        return {
          ...data,
          pairedAccounts: pairingData.accountIds,
          pairedWalletData: pairingData.metadata
        };
      });
    });
  }

  onMount(async () => {
    const nfts = $marketplaceSelectedStore
      .map(offset => offset.nft)
      .filter(
        (nft, index, self) =>
          index === self.findIndex(t => t.token_id === nft.token_id)
      );
    $marketplaceSelectedStore.length &&
      (offsetPriceRanges = await loadOffsetPriceRanges(nfts));
  });
</script>

<Card style="margin: 3rem">
  <Content style="background-color: #f8f3f8">
    <div class="title-header">
      <h6 class="table-title">SUMMARY</h6>
    </div>
    <DataTable stickyHeader table$aria-label="Offset list" style="width: 100%;">
      <Head>
        <Row>
          <Cell style="width:100%" columnId="nft.token_id">
            <Label>Offset ID</Label>
          </Cell>
          <Cell style="width:100%" columnId="owner_id">
            <Label>Owner ID</Label>
          </Cell>
          <Cell style="width:100%" columnId="price">
            <Label>Recommended Price</Label>
          </Cell>
          <Cell style="width:100%" columnId="nft.price">
            <Label>Price</Label>
          </Cell>
          <Cell style="width:100%">
            <Label />
          </Cell>
        </Row>
      </Head>
      <Body>
        {#if $marketplaceSelectedStore.length}
          {#each $marketplaceSelectedStore as offset (offset.nft.token_id + offset.nft.serial_number)}
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
              <Cell style="font-size: 1rem" numeric>
                {formatCurrency(offset.price)}
              </Cell>
              <Cell numeric>
                <IconButton
                  on:click={() => deselectOffset(offset)}
                  class="material-icons"
                  aria-label="wallet"
                  style="color: #676778">delete</IconButton
                >
              </Cell>
            </Row>
          {/each}
        {:else}
          <Cell>
            <div class="no-offsets">No offsets selected.</div>
          </Cell>
          <Cell />
        {/if}
      </Body>
    </DataTable>
    <div class="title-header">
      <div />

      <div>
        <Button
          variant="raised"
          color="secondary"
          on:click={goToMarketplace}
          style="margin: 1rem 1rem 0 0"
        >
          <Label>Cancel and Go back</Label>
        </Button>

        {#if walletConnected}
          <Button
            variant="raised"
            color="primary"
            style="margin-top: 1rem; width: 12rem"
            disabled={!$marketplaceSelectedStore.length || loading}
            on:click={() => (finalDialogOpen = true)}
          >
            {#if loading}
              <CircularProgress
                style="height: 32px; width: 32px;"
                indeterminate
              />
            {:else}
              <Label>Finalize Purchase</Label>
            {/if}
          </Button>
        {:else}
          <Button
            variant="raised"
            color="primary"
            style="margin-top: 1rem"
            on:click={connectWallet}
            disabled={walletConnected}
          >
            <Icon class="material-icons">wallet</Icon>
            <Label>Connect wallet</Label>
          </Button>
        {/if}
      </div>
    </div>
  </Content>
</Card>

<Dialog
  bind:open={finalDialogOpen}
  aria-labelledby="simple-title"
  aria-describedby="simple-content"
>
  <Title id="simple-title">Confirm Purchase</Title>
  <DialogContent id="simple-content">Are you sure?</DialogContent>
  <Actions>
    <Button>
      <ButtonLabel>No</ButtonLabel>
    </Button>
    <Button
      on:click={async () => {
        loading = true;
        try {
          await onFinalizePurchase();
        } finally {
          loading = false;
        }
      }}
    >
      <ButtonLabel>Yes</ButtonLabel>
    </Button>
  </Actions>
</Dialog>

<Dialog
  bind:open={confirmationDialogOpen}
  aria-labelledby="simple-title"
  aria-describedby="simple-content"
>
  <Title id="simple-title">Confirmation</Title>
  <DialogContent id="simple-content"
    >Purchase successfully initiated. Transaction ID for tracking: <span
      class="dialog-transaction-id">{transactionId || ''}</span
    >
  </DialogContent>
  <Actions>
    <Button on:click={onConfirmation}>
      <ButtonLabel>Okay</ButtonLabel>
    </Button>
  </Actions>
</Dialog>

<Snackbar bind:this={snackbar} labelText={snackbarText} timeoutMs={-1}>
  <SnackbarLabel />
  <SnackbarActions>
    <IconButton class="material-icons" title="Dismiss">close</IconButton>
  </SnackbarActions>
</Snackbar>

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

  .dialog-transaction-id {
    display: flex;
    margin-top: 5px;
    font-weight: 800;
    text-align: center;
  }
</style>
