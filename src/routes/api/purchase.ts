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

import type {RequestHandler} from '@sveltejs/kit';
import envVariables from '$environment';

export const POST: RequestHandler = async ({request}) => {
  const route = '/offsets/purchase';
  const fetchURL = `${envVariables.apiRootUrl + route}`;

  try {
    const response = await fetch(fetchURL, {
      method: 'POST',
      body: request.body,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return {
      status: response.status,
      body: JSON.stringify(data)
    };
  } catch (e) {
    let errorMessage;
    if (typeof e === 'string') {
      errorMessage = e.toUpperCase();
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }
    return {
      status: 500,
      body: JSON.stringify({error: errorMessage})
    };
  }
};
