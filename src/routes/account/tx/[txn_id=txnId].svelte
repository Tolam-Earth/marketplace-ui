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
  import {page} from '$app/stores';
  import TransactionStatus from '$lib/TransactionStatus.svelte';
  import {accountIdStore} from '$store';
  import {encodeHashScanId} from '$utils';

  onMount(() => {
    const txId = encodeHashScanId($page.params.txn_id);
    const encodedTxId = encodeURIComponent(txId);

    !$accountIdStore && goto('/');
    goto(`/account/?s=${encodedTxId}`, {replaceState: true});
  });
</script>

<TransactionStatus />
