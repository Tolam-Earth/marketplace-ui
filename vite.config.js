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

import {sveltekit} from '@sveltejs/kit/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

const plugins = [sveltekit()];
if (!process.env.RUNNING_UNDER_PLAYWRIGHT_TEST) plugins.unshift(basicSsl());

/** @type {import('vite').UserConfig} */
const config = {
  define: {
    global: 'globalThis'
  },
  preview: {
    https: !process.env.RUNNING_UNDER_PLAYWRIGHT_TEST
  },
  plugins
};

export default config;
