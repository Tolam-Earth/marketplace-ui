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
  import {
    ContractExecuteTransaction,
    ContractFunctionParameters,
    AccountId,
    ContractId
  } from '@hashgraph/sdk';
  import {onMount} from 'svelte';
  import type {Transaction} from '@hashgraph/sdk';
  import {goto} from '$app/navigation';
  import {Icon} from '@smui/common';
  import type {SnackbarComponentDev} from '@smui/snackbar';
  import CircularProgress from '@smui/circular-progress';
  import Snackbar, {
    Actions as SnackbarActions,
    Label as SnackbarLabel
  } from '@smui/snackbar';
  import IconButton from '@smui/icon-button';
  import {Label} from '@smui/common';
  import Button, {
    Group as ButtonGroup,
    Label as ButtonLabel
  } from '@smui/button';
  import Dialog, {Title, Content as DialogContent, Actions} from '@smui/dialog';
  import {
    unlistSelectedStore,
    hashpackWalletStore,
    hashconnectStore,
    accountIdStore,
    transactionsStore
  } from '$store';
  import envVariables from '$environment';
  import {
    convertCentsToDollars,
    convertDollarToCents,
    formatNFTsToSolidity,
    loadOffsetPriceRanges
  } from '$utils';
  import type {HashConnectSigner} from 'hashconnect/dist/provider/signer';
  import type {HashConnectProvider} from 'hashconnect/dist/provider/provider';
  import type {TransactionId} from '@hashgraph/sdk/lib/Signer';
  import type {Offset, OffsetPriceRange, PriceRangeValueOpts} from '$types';
  import SummaryDataTable from '$lib/SummaryDataTable.svelte';
  import {listOffsets} from '../../../services';

  let loading = false;
  let snackbar: SnackbarComponentDev;
  let snackbarText = '';
  let finalDialogOpen = false;
  let confirmationDialogOpen = false;
  let transactionId: TransactionId;
  let finalizeButtonDisabled = true;

  $: walletConnected = $hashpackWalletStore.pairedWalletData;
  $: finalizeButtonDisabled =
    !$unlistSelectedStore.length ||
    $unlistSelectedStore.some(
      offset => !offset.price || typeof offset.price !== 'number'
    ) ||
    loading;

  const goToAccount = () => goto(`/account`, {replaceState: false});
  const onConfirmation = () => goToAccount();

  const updatePriceByRecommendation = (
    usePriceRangeValue: PriceRangeValueOpts
  ) => {
    unlistSelectedStore.update(offsets => {
      offsets.forEach(offset => {
        const priceRange = offsetPriceRanges.find(
          priceRange => priceRange.nft_id.token_id === offset.nft.token_id
        );
        const min = convertCentsToDollars(priceRange.min_price);
        const max = convertCentsToDollars(priceRange.max_price);

        if (!(min && max)) return;
        offset.price = usePriceRangeValue === 'min' ? min : max;
      });
      return offsets;
    });
  };

  export let offsetPriceRanges: OffsetPriceRange[] = [];

  const deselectOffset = (deselected: Offset) => {
    unlistSelectedStore.update(offsets => {
      return offsets.filter(
        existing =>
          existing.nft.token_id !== deselected.nft.token_id ||
          existing.nft.serial_number !== deselected.nft.serial_number
      );
    });
  };

  const executeTheContract = async (
    transaction: Transaction,
    signer: HashConnectSigner
  ) => {
    const smartContractResponse = await transaction.executeWithSigner(signer);
    transactionId = smartContractResponse.transactionId;

    if (smartContractResponse) {
      unlistSelectedStore.set([]);
      transactionsStore.update((transactions: Array<Transaction>) => [
        ...transactions,
        {
          transactionId: smartContractResponse.transactionId,
          type: 'LIST',
          status: 'PENDING'
        }
      ]);
      confirmationDialogOpen = true;
    } else {
      snackbarText =
        'There was an issue signing the contract. Please try again or contact the admin.';
      snackbar && snackbar.open();
    }
  };

  const whiteListAndExecuteSmartContract = async (
    transaction: Transaction,
    signer: HashConnectSigner
  ) => {
    const whitelistBody = {
      txn_id: transaction.transactionId.toString(),
      account_id: $accountIdStore,
      nfts: $unlistSelectedStore.map(offset => ({
        ...offset.nft,
        price: convertDollarToCents(offset.price)
      }))
    };

    try {
      const whitelistResponse = await listOffsets(whitelistBody);

      console.log(whitelistResponse);
      if (whitelistResponse && whitelistResponse.request?.txn_id) {
        await executeTheContract(transaction, signer);
      } else {
        snackbarText =
          'There was an issue finalizing the offsets. Please try again or contact the admin.';
        snackbar && snackbar.open();
      }
    } catch (error) {
      snackbarText =
        'There was an issue finalizing the offsets. Please try again or contact the admin.';
      snackbar && snackbar.open();
    }
  };

  const onFinalizeListing = async () => {
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

    const formattedNFTs = formatNFTsToSolidity($unlistSelectedStore, true);

    const transaction: Transaction = await new ContractExecuteTransaction()
      .setContractId(ContractId.fromString(smartContractId))
      .setFunction(
        'list_offset',
        new ContractFunctionParameters()
          .addAddress(accountIDSolidity)
          .addAddressArray(formattedNFTs.tokenIds)
          .addInt64Array(formattedNFTs.serialIds)
          .addUint256Array(formattedNFTs.prices)
      )
      .setGas(5000000)
      .freezeWithSigner(signer);

    await whiteListAndExecuteSmartContract(transaction, signer);
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
    const nfts = $unlistSelectedStore
      .map(offset => offset.nft)
      .filter(
        (nft, index, self) =>
          index === self.findIndex(t => t.token_id === nft.token_id)
      );
    $unlistSelectedStore.length &&
      (offsetPriceRanges = await loadOffsetPriceRanges(nfts));
  });
</script>

<SummaryDataTable
  {offsetPriceRanges}
  on:deselect={({detail: {offset}}) => deselectOffset(offset)}
>
  <div slot="toolbar" class="toolbar">
    <fieldset>
      <legend class="mdc-typography--body1">Autofill prices</legend>
      <ButtonGroup>
        <Button
          variant="outlined"
          disabled={$unlistSelectedStore.length === 0}
          on:click={() => updatePriceByRecommendation('min')}
        >
          <Label>Use Min</Label>
        </Button>
        <Button
          variant="outlined"
          disabled={$unlistSelectedStore.length === 0}
          on:click={() => updatePriceByRecommendation('max')}
        >
          <Label>Use Max</Label>
        </Button>
      </ButtonGroup>
    </fieldset>
  </div>
  <svelte:fragment slot="footer">
    <Button
      variant="raised"
      color="secondary"
      on:click={goToAccount}
      style="margin: 1rem 1rem 0 0"
    >
      <Label>Cancel and Go back</Label>
    </Button>

    {#if walletConnected}
      <Button
        variant="raised"
        color="primary"
        style="margin-top: 1rem; width: 12rem"
        disabled={finalizeButtonDisabled}
        on:click={() => (finalDialogOpen = true)}
      >
        {#if loading}
          <CircularProgress style="height: 32px; width: 32px;" indeterminate />
        {:else}
          <Label>Finalize Listing</Label>
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
  </svelte:fragment>
</SummaryDataTable>

<Dialog
  bind:open={finalDialogOpen}
  aria-labelledby="simple-title"
  aria-describedby="simple-content"
>
  <Title id="simple-title">Confirm Listing</Title>
  <DialogContent id="simple-content">Are you sure?</DialogContent>
  <Actions>
    <Button>
      <ButtonLabel>No</ButtonLabel>
    </Button>
    <Button
      on:click={async () => {
        loading = true;
        try {
          await onFinalizeListing();
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
    >Listing successfully initiated. Transaction ID for tracking: <span
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
  .toolbar {
    fieldset {
      display: inline-flex;
      border: 0;
      padding: 0;
    }
    legend {
      float: left;
      margin: 0.3125rem;
    }
  }
  .dialog-transaction-id {
    display: flex;
    margin-top: 5px;
    font-weight: 800;
    text-align: center;
  }
</style>
