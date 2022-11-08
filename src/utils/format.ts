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

import type {Offset} from '$types';
import {TokenId} from '@hashgraph/sdk';

export const formatNFTsToSolidity = (
  offsets: Offset[],
  convertToCents: boolean
) => {
  return offsets.reduce(
    (accumulator, curr) => {
      const solidityTokenId = TokenId.fromString(
        curr.nft.token_id
      ).toSolidityAddress();

      const newTokenIds = [...accumulator.tokenIds, solidityTokenId];
      const newSerialIds = [...accumulator.serialIds, curr.nft.serial_number];
      const newPrice = [
        ...accumulator.prices,
        convertToCents ? convertDollarToCents(curr.price) : curr.price
      ];

      return {
        tokenIds: newTokenIds,
        serialIds: newSerialIds,
        prices: newPrice
      };
    },
    {tokenIds: [], serialIds: [], prices: []}
  );
};

export const formatCurrency = (
  price: number,
  locale?: string | undefined,
  currencyCode?: string
) => {
  return Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode ? currencyCode : 'USD',
    minimumFractionDigits: 2
  }).format(price / 100);
};

export const convertDollarToCents = (price: number | string) =>
  Number((Number(price) * 100).toFixed());

export const convertCentsToDollars = (price: number | string) =>
  Number((Number(price) / 100).toFixed(2));

export const encodeHashScanId = (hashscanId: string) => {
  const parts = hashscanId.split('@');

  return `${parts[0]}-${parts[1].replace('.', '-')}`;
};
export const formatHashScanTxLookupUri = (
  transactionId: string,
  network = 'testnet'
) => {
  const encoded = encodeHashScanId(transactionId);

  return `https://hashscan.io/#/${network}/transactionsById/${encoded}`;
};

export default null;
