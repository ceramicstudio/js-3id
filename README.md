![ceramicnetwork](https://circleci.com/gh/ceramicstudio/3id-connect.svg?style=shield)
[![](https://img.shields.io/badge/Chat%20on-Discord-orange.svg?style=flat)](https://discord.gg/6VRZpGP)
[![Twitter](https://img.shields.io/twitter/follow/ceramicnetwork?label=Follow&style=social)](https://twitter.com/ceramicnetwork)

# <a name="intro"></a> 3ID-Connect

![3ID Connect Image](./assets/3id-connect_readme-image.png)

3ID user account management in a iframe. An easy way to access a did provider, specifically [ThreeIdProvider](https://github.com/ceramicstudio/js-3id-did-provider) in the browser. It allows users to authenticate, manage, link and permission their 3ID keys to applications. The library [js-3id-did-provider](https://github.com/ceramicstudio/js-3id-did-provider) handles most operations and the parent window (application) communicates with the iframe service over an RPC layer. 3id-connect with Ceramic support is only available at 3id-connect@next and 3idconnect.org at the moment.

## Folders

- [`connect`](./connect): 3ID Connect iframe and library
- [`management`](./management): 3ID accounts management UI
- [`public`](./public): build assets
