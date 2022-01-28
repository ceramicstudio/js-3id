# Class: ThreeIdConnect

[connect/src](../modules/connect_src.md).ThreeIdConnect

 ThreeIdConnect provides interface for loading and instantiating IDW iframe,
 and provides a 3ID provider interface to send requests to iframe. Acts like
 rpc client.

## Constructors

### constructor

• **new ThreeIdConnect**(`network?`)

 Creates ThreeIdConnect. Create and loads iframe. Should be instantiated
 on page load.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `network?` | `string` | network name: testnet-clay, dev-unstable, local and mainnet are supported or or iframe url |

## Properties

### RPCClient

• **RPCClient**: `undefined` \| `RPCClient`<`any`\>

___

### RPCProvider

• **RPCProvider**: `undefined` \| `DIDProvider`

___

### \_authProviderSubscription

• **\_authProviderSubscription**: ``null`` \| `Subscription` = `null`

___

### \_connected

• **\_connected**: `boolean` = `false`

___

### accountId

• **accountId**: `undefined` \| `string`

___

### authProvider

• **authProvider**: `undefined` \| `AuthProvider`

___

### iframe

• **iframe**: `HTMLIFrameElement`

___

### iframeLoadedPromise

• **iframeLoadedPromise**: `Promise`<`void`\>

___

### manageUrl

• **manageUrl**: `string`

___

### postMessage

• **postMessage**: `undefined` \| `PostMessage`

## Accessors

### connected

• `get` **connected**(): `boolean`

#### Returns

`boolean`

## Methods

### connect

▸ **connect**(`provider`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `provider` | `AuthProvider` |

#### Returns

`Promise`<`void`\>

___

### getDidProvider

▸ **getDidProvider**(): [`DidProviderProxy`](connect_src.DidProviderProxy.md)

 Returns a DID provider, which can send and receive messages from iframe

#### Returns

[`DidProviderProxy`](connect_src.DidProviderProxy.md)

A DID provider

___

### setAuthProvider

▸ **setAuthProvider**(`authProvider`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `authProvider` | `AuthProvider` |

#### Returns

`Promise`<`void`\>
