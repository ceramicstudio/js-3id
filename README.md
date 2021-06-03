![ceramicnetwork](https://circleci.com/gh/ceramicstudio/3id-connect.svg?style=shield)
[![](https://img.shields.io/badge/Chat%20on-Discord-orange.svg?style=flat)](https://discord.gg/6VRZpGP)
[![Twitter](https://img.shields.io/twitter/follow/ceramicnetwork?label=Follow&style=social)](https://twitter.com/ceramicnetwork)

# <a name="intro"></a> 3ID-Connect

![3ID Connect Image](./assets/3id-connect_readme-image.png)

3ID Connect provides 3ID user account management in a iframe, an easy way to access a DID provider, specifically [ThreeIdProvider](https://github.com/ceramicstudio/js-3id-did-provider) in the browser.
It allows users to authenticate, manage, link and permission their 3ID keys to applications.

The library [js-3id-did-provider](https://github.com/ceramicstudio/js-3id-did-provider) handles most operations and the parent window (application) communicates with the iframe service over an RPC layer.

## Getting started

### Installation

```sh
npm install @3id/connect
```

### Basic usage

```ts
import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'

// ethProvider is an Ethereum provider and addresses an array of strings
const authProvider = new EthereumAuthProvider(ethProvider, addresses[0])

const threeIdConnect = new ThreeIdConnect()
await threeIdConnect.connect(authProvider)
```

See the [example app](./apps/example) for more details

## Developement

### Prerequisites

yarn v1 and lerna v4 should be installed globally:

```sh
npm install -g lerna yarn
```

### Installation

Run `yarn install` from the root folder, this will install the dependencies and build the packages

### Scripts

In the root folder:

- `lint`: lints all apps and packages
- `build`: builds all packages
- `test:unit`: runs unit test
- `test:management`: runs integration tests for the [management lib](./packages/management) with a Ceramic server
- `test:integration`: runs integration tests from the [integration app](./apps/integration) with a Ceramic server

## Folders

### Packages

- [`@3id/common`](./packages/common): Common types and utilities used by packages
- [`@3id/connect`](./packages/connect): 3ID Connect library
- [`@3id/connect-display`](./packages/connect-display): 3ID Connect popup prompts
- [`@3id/manager`](./packages/manager): 3ID accounts storage and management
- [`@3id/test-utils`](./packages/test-utils): Testing utilities for apps and packages
- [`@3id/window-auth-provider`](./packages/window-auth-provider): cross-window AuthProvider

### Apps

- [`example`](./apps/example): Example usage of 3ID Connect with Ceramic and IDX
- [`iframe`](./apps/iframe): 3ID Connect iframe logic and UI
- [`integration`](./apps/integration): 3ID Connect integration tests
- [`management`](./apps/management): 3ID accounts management UI used by 3ID Connect

### Others

- [`public`](./public): build assets for 3idconnect.org

## Licenses

- Apache-2.0 OR MIT for published packages
- UIs used by 3ID Connect may use dependencies under other licenses
