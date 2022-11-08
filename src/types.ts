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

export type ListState = 'UNLISTED' | 'LISTED' | 'PURCHASED' | 'ALL';
export type PriceRangeValueOpts = 'none' | 'min' | 'max';

type NftTokenId = `${number}.${number}.${number}`;

export type NFT = {
  token_id: NftTokenId;
  serial_number: number;
};

export interface KeyedNFT {
  nft_id: {
    token_id: NftTokenId;
    serial_number: number;
  };
}

export type OffsetResponse = {
  list_state: ListState;
  offset: Offset;
};

export interface Offset {
  price: number | null;
  owner_id: string;
  nft: NFT;
}

export type OffsetESGSummaryRequestOpts =
  | 'Project Category'
  | 'Project Type'
  | 'Project Name'
  | 'Project Country'
  | 'Project Region'
  | 'Vintage';

export type SimpleSearchRequest = Partial<{
  [key in OffsetESGSummaryRequestOpts]: string[];
}>;

export type OffsetESGSummary = Offset & {
  project_category: string;
  project_type: string;
  project_name: string;
  project_country: string;
  project_region: string;
  vintage: string;
};

export interface SimpleSearchResponse {
  request: {
    [key in OffsetESGSummaryRequestOpts]: string[];
  };
  results: OffsetESGSummary[];
}

export type OffsetsDataResponse = {
  req: {
    account_id: string;
    list_state: ListState;
    order: string;
    limit: number;
  };
  offsets: OffsetResponse[];
};

export interface OffsetPriceRange {
  nft_id: Omit<NFT, 'price'>;
  min_price: number;
  max_price: number;
  code: number;
  message: string;
}

export interface OffsetPriceRangeRequest {
  nfts: KeyedNFT[];
}

export interface OffsetPriceRangeResponse {
  request: KeyedNFT[];
  prices: OffsetPriceRange[];
}

export type TransactionType = 'LIST' | 'PURCHASE';
export type ListingStatus = 'PENDING' | 'CREATED' | 'APPROVED' | 'LISTED';
export type PurchaseStatus = ListingStatus & 'PURCHASED';

export interface TransactionResponse {
  request: {
    txn_id: string;
    txn_type: string;
  };
  state: ListingStatus & PurchaseStatus;
}

export interface ConversionRateResponse {
  rate: number;
}

type TransactionId = `${number}.${number}.${number}@${number}.${number}`;
// e.g. 0.0.47664997@1659651494.601490554

export interface Transaction {
  transactionId: TransactionId;
  type: TransactionType;
  status: ListingStatus & PurchaseStatus;
}

export type Error = {
  error:
    | string
    | {
        message: string;
      };
};

export enum ListingStatusMap {
  PENDING = 1,
  CREATED = 2,
  APPROVED = 2,
  LISTED = 3
}

export enum PurchaseStatusMap {
  PENDING = 1,
  CREATED = 2,
  APPROVED = 2,
  LISTED = 2,
  PURCHASED = 3
}

export interface ESGMRV {
  title: string;
  description: string;
  value: string | ESGMRV[];
  type: string;
  schema_cid: string;
  schema_name: string;
}

export interface ESGDetailsResponse {
  request: NFT;
  actual_owner: string;
  retail_price: number;
  min_arm_price: number;
  max_arm_price: number;
  project_category: string;
  project_type: string;
  project_name: string;
  project_country: string;
  project_region: string;
  vintage: string;
  credential_subjects: ESGMRV[];
}
