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

import type {
  NFT,
  OffsetPriceRangeResponse,
  OffsetPriceRangeRequest,
  OffsetPriceRange
} from '$types';
import {formatCurrency} from '$utils';
import {getPrice} from '../services';

export const loadOffsetPriceRanges = async (nfts: NFT[]) => {
  const requestBody: OffsetPriceRangeRequest = {
    nfts: nfts.map(nft => {
      return {nft_id: {...nft}};
    })
  };
  const data: OffsetPriceRangeResponse = await getPrice(requestBody);

  return data.prices;
};

export const offsetPriceRangeForId = (
  tokenId: string,
  offsetPriceRanges: OffsetPriceRange[]
) => {
  const priceRange = offsetPriceRanges.find(
    priceRange => priceRange.nft_id.token_id === tokenId
  );
  const min = priceRange.min_price;
  const max = priceRange.max_price;

  return min && max ? `${formatCurrency(min)} - ${formatCurrency(max)}` : '–';
};
