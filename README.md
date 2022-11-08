# Tolam Markets UI

## Setup

Copy `.env-example` to `.env` before running the app. Smart Contract ID used should match what's used for Microservices and may be generated using the NPM scripts provided in the Smart Contract repository.

## Structure

The application structure is as follows:

```
├── build
├── playwright
├── src
│   ├── lib
│   ├── params
│   ├── routes
│   ├── theme
│   ├── utils
├── static
└── tests
    ├── __mocks__
    └── component
```

## Developing

Once you've completed [Setup](#setup) and installed dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Basic Usage

Once running with a suitable Hedera smart contract identifier specified in the `.env` file and a browser window opened to the development url established during [Developing](#developing) connect your Hashpack wallet using the _Connect Wallet_ button to access **Sell** functionality or choose **Buy** to view the Marketplace and connect your wallet after browsing Carbon Offset Credits for sale.

**Note:** In order to list offset credits for sale, they must either be purchased first, or seeded to a wallet using the convenience NPM script provided in the Smart Contracts repo. See the NPM scripts in the Smart Contracts repository for a scripted solution to account creation and set-up.

## Testing

To run Browser and Component tests with Playwright:

```bash
npm run test:browser
npm run test:components

# or run both browser and component tests with a single command
npm run test
```

See the Test Automation repo for Cypress E2E tests.

## Scanning

[Trivy](https://github.com/aquasecurity/trivy) is used to scan this repository for exposed secrets, vulnerable third-party libraries, vulnerable images, and Dockerfile misconfigurations via GitHub Actions. You may run these scans locally to enable faster development.

Scan for exposed secrets and vulnerable third-party libraries:

```
trivy fs .
```

Scan for Dockerfile misconfigurations:

```
trivy config .
```

Scan for image vulnerabilities:

```
trivy image IMAGE_NAME . 
```

### Excluding Issues

Sometimes, a third-party library hasn't been updated to fix the security vulnerability. In that case, you may ignore these issues by placing the vulnerability ID (CVE) into the `.trivyignore` file.

For example, you may get output such as:

```
┌────────────────┬────────────────┬──────────┬───────────────────┬────────────────────────────┐
│    Library     │ Vulnerability  │ Severity │ Installed Version │       Fixed Version        │
├────────────────┼────────────────┼──────────┼───────────────────┼────────────────────────────┤
│ @xmldom/xmldom │ CVE-2022-37616 │ CRITICAL │ 0.7.5             │ 0.7.6, 0.8.3, 0.9.0-beta.2 │
│                │                │          │                   │                            │
│                │                │          │                   │                            │
└────────────────┴────────────────┴──────────┴───────────────────┴────────────────────────────┘
```

This output provides an ID of `CVE-2022-37616`. Place this ID in the `.trivyignore` file and **make sure that the ID is capitalized**.

## License

Copyright 2022 Tolam Earth

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
