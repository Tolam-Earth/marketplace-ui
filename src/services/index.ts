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
  OffsetsDataResponse,
  SimpleSearchRequest,
  SimpleSearchResponse,
  ConversionRateResponse,
  ESGDetailsResponse,
  OffsetPriceRangeResponse,
  OffsetPriceRangeRequest,
  OffsetResponse,
  TransactionResponse
} from '$types';
import {getJson, postJson} from './fetch';

export const getSimpleSearch = async (
  body: SimpleSearchRequest
): Promise<SimpleSearchResponse> => {
  return postJson('/simplesearch', body);
};

export const getOffsets = async (
  accountID: string,
  listType: string
): Promise<OffsetsDataResponse> => {
  const path = `/offsets?account_id=${accountID}&list_state=${listType}&limit=100`;
  const data = await getJson(path);

  data.offsets?.forEach((offset: OffsetResponse) => {
    if (offset.list_state === 'UNLISTED') {
      offset.offset.price = null;
    }
  });
  return data;
};

export const getConversion = async (
  type: string
): Promise<ConversionRateResponse> => {
  const path = `/conversion?type=${type}`;
  return getJson(path);
};

export const getOffsetDetails = async (
  tokenId: string,
  serialNumber: number
): Promise<ESGDetailsResponse> => {
  const path = `/esg?token_id=${tokenId}&serial_number=${serialNumber}`;
  return getJson(path);
};

export const getPrice = async (
  body: OffsetPriceRangeRequest
): Promise<OffsetPriceRangeResponse> => {
  return postJson('/price', body);
};

export const listOffsets = async body => {
  return postJson('/offsets/list', body);
};

export const purchaseOffsets = async body => {
  return postJson('/offsets/purchase', body);
};

export const getTransactionDetails = async (
  transactionId: string,
  transactionType: string
): Promise<TransactionResponse> => {
  const path = `/offsets/txn?txn_id=${transactionId}&txn_type=${transactionType}`;
  return getJson(path);
};
