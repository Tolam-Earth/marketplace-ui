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

/* @type import('$lib/types').SimpleSearchResponse */
export const esgSummary = {
  request: {
    'Project Category': ['Solar', 'Wind'],
    'Project Type': ['Green', 'Energy']
  },
  results: [
    {
      owner_id: '0.0.2',
      nft: {
        token_id: '0.0.2255156',
        serial_number: 1
      },
      price: 1500,
      project_category: 'Solar',
      project_type: 'Green',
      project_name: 'Solar Project 1',
      project_country: 'Indonesia',
      project_region: 'SEA',
      vintage: '2020'
    },
    {
      owner_id: '0.0.2',
      nft: {
        token_id: '0.0.2255156',
        serial_number: 2
      },
      price: 1000,
      project_category: 'Wind',
      project_type: 'Energy',
      project_name: 'Wind Project 2',
      project_country: 'Kenya',
      project_region: 'Africa',
      vintage: '2021'
    }
  ]
};
