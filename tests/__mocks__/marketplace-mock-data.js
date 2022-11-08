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

export const purchasableOffsets = {
  offsets: [
    {
      list_state: 'LISTED',
      offset: {
        owner_id: '0.0.1082',
        nft: {token_id: '0.0.2255156', serial_number: 1},
        price: 1500
      }
    },
    {
      list_state: 'LISTED',
      offset: {
        owner_id: '0.0.1082',
        nft: {token_id: '0.0.2255156', serial_number: 2},
        price: 1000
      }
    },
    {
      list_state: 'LISTED',
      offset: {
        owner_id: '0.0.1082',
        nft: {token_id: '0.0.2255162', serial_number: 1},
        price: 1100
      }
    }
  ],
  req: {
    account_id: null,
    token_id: null,
    order: 'ASC',
    limit: 100,
    list_state: 'LISTED'
  }
};
