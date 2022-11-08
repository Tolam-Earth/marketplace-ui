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
  import {goto} from '$app/navigation';
  import Button, {Group as ButtonGroup, Label} from '@smui/button';
  import TextField from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import Paper from '@smui/paper';
  import {Icon} from '@smui/common';
  import {accountIdStore, hashpackWalletStore, hashconnectStore} from '$store';

  const hashpackWalletStoreUpdate = (data, name: string) => {
    hashpackWalletStore.update(store => {
      return {
        ...store,
        [name]: data
      };
    });
  };

  const connectWallet = async () => {
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
  };

  //eslint-disable-next-line
  const reg = /[0][\.][0][\.]\d+$/;
  $: goDisabled = !$accountIdStore.match(reg);
  $: walletConnected = $hashpackWalletStore.pairedWalletData;

  const handleFormSubmit = () => routeToPage('account', false);

  const routeToPage = (route: string, replaceState: boolean) => {
    goto(`/${route}`, {replaceState});
  };
</script>

<div class="account-form-container">
  <Paper elevation={10}>
    <form on:submit|preventDefault={handleFormSubmit}>
      <div class="person-icon">
        <Icon class="material-icons" style="font-size:48px; color: #303036"
          >person</Icon
        >
      </div>
      <div id="content">
        <div class="login">
          <div class="field">
            <TextField
              bind:value={$accountIdStore}
              label="Account ID"
              variant="outlined"
              style="width: 100%"
              required
            >
              <HelperText slot="helper">Ex: 0.0.281922</HelperText>
            </TextField>
          </div>
        </div>
      </div>

      <div class="cta-wrapper">
        <div class="btn-group">
          <ButtonGroup>
            <Button
              variant="outlined"
              color="primary"
              on:click$preventDefault={() => routeToPage('marketplace', false)}
            >
              <Label>Buy offsets</Label>
            </Button>
            <Button
              type="submit"
              variant="unelevated"
              color="primary"
              disabled={goDisabled}
            >
              <Label>Sell offsets</Label>
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </form>

    <div class="or-wrapper">
      <div class="or">or</div>
    </div>

    <div class="wallet-button-wrapper">
      <div class="button">
        <Button
          variant="raised"
          color="secondary"
          on:click={connectWallet}
          disabled={walletConnected}
        >
          <Icon class="material-icons">wallet</Icon>
          {#if walletConnected}
            <Label>Connected</Label>
          {:else}
            <Label>Connect wallet</Label>
          {/if}
        </Button>
      </div>
    </div>
  </Paper>
</div>

<style>
  .person-icon {
    text-align: center;
  }
  .or-wrapper {
    display: flex;
    justify-self: center;
    margin-top: 1rem;
  }

  .or-wrapper .or {
    width: 100%;
    text-align: center;
    color: darkgray;
    font-family: 'Roboto';
  }

  .wallet-button-wrapper {
    display: flex;
    justify-self: center;
    margin-top: 1rem;
  }

  .wallet-button-wrapper .button {
    width: 100%;
    text-align: center;
  }

  .account-form-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 15rem;
  }

  .cta-wrapper {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
  }

  .login {
    width: 22rem;
    margin: 0 auto;
    margin-top: 10%;
    display: block;
  }
  .login .field {
    display: block;
    width: 100%;
  }
  .login .field:nth-child(2) {
    margin-top: 1rem;
  }
</style>
