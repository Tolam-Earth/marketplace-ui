/*!
 * Copyright 2022 Tolam Earth
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {writable} from 'svelte/store';
import type {Offset, OffsetESGSummary} from '$types';
import {browser} from '$app/env';
import type {HashConnect} from 'hashconnect';

function persist(key: string, value) {
  if (browser) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
}

function writableSession(key: string, initialValue) {
  let sessionValue;
  if (browser) {
    sessionValue = JSON.parse(sessionStorage.getItem(key));
  }
  if (!sessionValue) persist(key, initialValue);

  const store = writable(sessionValue || initialValue);
  store.subscribe(value => persist(key, value));
  return store;
}

export const marketplaceSelectedStore = writable<OffsetESGSummary[]>([]);
export const marketplaceOffsetsStore = writable<OffsetESGSummary[]>([]);

export const accountIdStore = writableSession('accountId', '');

export const listTypeStore = writableSession('listType', 'ALL');

export const unlistSelectedStore = writable<Offset[]>([]);

export const unlistedOffsetsStore = writable<Offset[]>([]);

export const listedOffsetsStore = writable<Offset[]>([]);

export const hashconnectStore = writable<HashConnect>(null);

export const hashpackWalletStore = writableSession('hashpackWallet', {
  pairedAccounts: [],
  pairedWalletData: null,
  pairingString: '',
  privateKey: '',
  connectionState: null
});

export const transactionsStore = writableSession('transactions', []);
// {transactionId: '0.0.47664997@1659651494.601490554', status: 'PENDING'}
