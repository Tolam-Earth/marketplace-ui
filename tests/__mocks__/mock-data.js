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

/* @type import('$lib/types').OffsetPriceRangeResponse */
export const priceRangeMockData = {
  prices: [
    {nft_id: '0.0.2220290', min_price: 63, max_price: 68},
    {nft_id: '0.0.2220220', min_price: 35, max_price: 38}
  ],
  request: {nfts: ['0.0.2220290', '0.0.2220220']}
};

/* @type import('$lib/types').Account */
export const unlistedMockData = {
  offsets: [
    {
      list_state: 'UNLISTED',
      offset: {
        owner_id: '0.0.2',
        nft: {
          serial_number: 1,
          token_id: '0.0.2220290'
        }
      }
    },
    {
      list_state: 'UNLISTED',
      offset: {
        owner_id: '0.0.2',
        nft: {
          serial_number: 3,
          token_id: '0.0.2220220'
        }
      }
    }
  ],
  req: {
    account_id: '0.0.2',
    list_state: 'UNLISTED',
    order: 'ASC',
    limit: 50
  }
};

/* @type import('$lib/types').Account */
export const listedMockData = {
  offsets: [
    {
      list_state: 'LISTED',
      offset: {
        owner_id: '0.0.2',
        nft: {
          serial_number: 1,
          token_id: '0.0.22222290'
        }
      }
    },
    {
      list_state: 'LISTED',
      offset: {
        owner_id: '0.0.2',
        nft: {
          serial_number: 5,
          token_id: '0.0.222029130'
        }
      }
    }
  ],
  req: {
    account_id: '0.0.2',
    list_state: 'LISTED',
    order: 'ASC',
    limit: 50
  }
};

export const allMockData = {
  offsets: [
    {
      list_state: 'UNLISTED',
      offset: {
        owner_id: '0.0.2',
        nft: {
          serial_number: 1,
          token_id: '0.0.2220290'
        },
        price: null
      }
    },
    {
      list_state: 'UNLISTED',
      offset: {
        owner_id: '0.0.2',
        nft: {
          serial_number: 3,
          token_id: '0.0.2220220'
        },
        price: null
      }
    },
    {
      list_state: 'LISTED',
      offset: {
        owner_id: '0.0.2',
        nft: {
          serial_number: 1,
          token_id: '0.0.22222290'
        },
        price: 100
      }
    },
    {
      list_state: 'LISTED',
      offset: {
        owner_id: '0.0.2',
        nft: {
          serial_number: 5,
          token_id: '0.0.222029130'
        },
        price: 100
      }
    }
  ],
  req: {
    account_id: '0.0.2',
    list_state: 'ALL',
    order: 'ASC',
    limit: 50
  }
};
