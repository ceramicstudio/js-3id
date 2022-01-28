# Class: DidProviderProxy

[connect/src](../modules/connect_src.md).DidProviderProxy

 A DID provider proxy, DID provider interface that acts as rpc client, to
 relay request to iframe (rpc server)

## Implements

- `DIDProviderWithOrigin`

## Constructors

### constructor

• **new DidProviderProxy**(`provider`, `accountId`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `provider` | `DIDProviderWithOrigin` |
| `accountId` | `string` |

## Properties

### accountId

• **accountId**: `string`

___

### provider

• **provider**: `DIDProviderWithOrigin`

## Accessors

### isDidProvider

• `get` **isDidProvider**(): `boolean`

#### Returns

`boolean`

## Methods

### send

▸ **send**<`Name`\>(`msg`, `origin?`): `Promise`<``null`` \| `DIDResponse`<`Name`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Name` | extends keyof `DIDProviderMethods` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `RPCRequest`<`DIDProviderMethods`, `Name`\> |
| `origin?` | ``null`` \| `string` |

#### Returns

`Promise`<``null`` \| `DIDResponse`<`Name`\>\>

#### Implementation of

DIDProviderWithOrigin.send
