![ceramicnetwork](https://circleci.com/gh/ceramicstudio/3id-connect.svg?style=shield)
[![](https://img.shields.io/badge/Chat%20on-Discord-orange.svg?style=flat)](https://discord.gg/6VRZpGP)
[![Twitter](https://img.shields.io/twitter/follow/ceramicnetwork?label=Follow&style=social)](https://twitter.com/ceramicnetwork)

# <a name="intro"></a> 3ID-Connect

![3ID Connect Image](./assets/3id-connect_readme-image.png)

3ID user account management in a iframe. An easy way to access a did provider and [identity wallet](https://github.com/3box/identity-wallet-js) in the browser. It allows users to authenticate, manage, link and permission their 3ID keys to applications. The library [identity-wallet-js](https://github.com/3box/identity-wallet-js) handles most operations and the parent window (application) communicates with the iframe service over an RPC layer.

## <a name="use"></a> Use

```
npm install 3id-connect@next
```

Example usage with an ethereum provider and related auth provider.

```js
import { ThreeIdConnect,  EthereumAuthProvider } from '@ceramicstudio/3id-connect'

// assuming ethereum provider available or on window
const addresses = await provider.enable()

const authProvider = new EthereumAuthProvider(provider, addresses[0])
await threeIdConnect.connect(authProvider)

const didProvider = await threeIdConnect.getDidProvider()

// now consume didProvider in ceramic clients, idx, dids libraries, etc
```

## <a name="structure"></a> Structure

* **/src** - Core logic and consumable interfaces for clients and iframe
  *  **/threeIdConnect.js** -  Application interface (RPC client) to load iframe and return 3ID provider.
  *  **/connectService.js** - Identity wallet instance and RPC 'server' to handle requests
  *  **/didProviderProxy.js** -  DID provider interface that relays request through RPC layer
  * **/authProvider** - 3ID connect (client) consumes an auth provider, auth providers can be implemented to support many different blockchain accounts and authentication methods
      *  **/abstractAuthProvider.js** -  Interface used to implement a auth provider
      *  **/ethereumAuthProvider.js** -  Etheruum auth provider, to link and authenticate with ethereum accounts
* **/iframe** - all html, css, js, design assets for iframe and flow
* **/public** - build assets deployed for iframe

## <a name="development"></a> Development

Clone and install dependencies

#### Run Example

Will serve iframe locally on port 30001 and an example app on port 30000. Example app available in example folder. 

```
$ npm run start:example
```

#### Run Iframe Locally

Will serve iframe locally on port 30001

```
$ npm run start
```

#### Build

```
$ npm run build
```

## Maintainers
[@zachferland](https://github.com/zachferland)
