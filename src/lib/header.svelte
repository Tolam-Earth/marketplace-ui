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
<script context="module" lang="ts">
  export const prerender = true;
  import {Buffer as BufferPolyfill} from 'buffer';
  declare var Buffer: typeof BufferPolyfill;
  globalThis.Buffer = BufferPolyfill;
</script>

<script lang="ts">
  /* eslint-disable no-use-before-define */
  import TopAppBar, {Row, Section, Title} from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';

  import {hashpackWalletStore, hashconnectStore} from '$store';
  import type {HashConnect, HashConnectTypes} from 'hashconnect';
  import {onMount} from 'svelte';

  let appData: HashConnectTypes.AppMetadata = {
    name: 'Tolam Markets',
    description: 'Buy and sell ESG carbon offset credits.',
    icon: ''
  };

  onMount(async () => {
    const {HashConnect} = await import('hashconnect');
    const hashconnect: HashConnect = new HashConnect(true);

    const noWalletData =
      !$hashpackWalletStore.connectionState?.topic ||
      !$hashpackWalletStore.privateKey ||
      !$hashpackWalletStore.pairedWalletData;

    if (noWalletData) {
      let initData: HashConnectTypes.InitilizationData;
      hashconnectStore.set(hashconnect);
      initData = await $hashconnectStore.init(appData);
      const state = await $hashconnectStore.connect();
      hashpackWalletStore.update(store => {
        return {
          ...store,
          privateKey: initData.privKey,
          connectionState: state
        };
      });
    } else {
      hashconnectStore.set(hashconnect);
      await $hashconnectStore.init(appData, $hashpackWalletStore.privateKey);
      await $hashconnectStore.connect(
        $hashpackWalletStore.connectionState?.topic,
        $hashpackWalletStore.pairedWalletData!
      );
    }
  });
</script>

<TopAppBar variant="static" color="primary">
  <Row>
    <Section>
      <IconButton class="material-icons">menu</IconButton>
      <Title>
        <a class="app-name" href="/">Tolam Markets</a>
      </Title>
    </Section>
    <Section align="end" toolbar>
      <IconButton class="material-icons" aria-label="account" href="/"
        >person</IconButton
      >
      <IconButton class="material-icons" aria-label="wallet">wallet</IconButton>
      <IconButton class="material-icons" aria-label="Bookmark this page"
        >bookmark</IconButton
      >
    </Section>
  </Row>
</TopAppBar>

<style>
  a.app-name {
    text-decoration: none;
    color: white;
  }
</style>
