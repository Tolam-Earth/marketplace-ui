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

import envVariables from '$environment';

async function handleError(res, method, path) {
  if (res.ok) return;

  let msg = await res.text();
  if (!msg) msg = res.status + ' error from ' + method + ' ' + path;
  throw new Error(msg);
}

export async function getJson(path: string) {
  const url = envVariables.apiRootUrl + path;
  try {
    const res = await fetch(url);
    await handleError(res, 'GET', path);
    return await res
      .text()
      .then(text => (text.length ? JSON.parse(text) : null));
  } catch (e) {
    console.error(e);
  }
}

export async function postJson(path, body) {
  const url = envVariables.apiRootUrl + path;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    await handleError(res, 'POST', path);
    return res.json();
  } catch (e) {
    console.error(e);
  }
}
