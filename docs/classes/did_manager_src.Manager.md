# Class: Manager

[did-manager/src](../modules/did_manager_src.md).Manager

## Constructors

### constructor

• **new Manager**(`authprovider`, `opts`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `authprovider` | `AuthProvider` |
| `opts` | `Object` |
| `opts.cache?` | [`LinkCache`](did_manager_src.LinkCache.md) |
| `opts.ceramic?` | `CeramicApi` |
| `opts.dataStore?` | `DIDDataStore`<`ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\>, `string`\> |
| `opts.store?` | [`DIDStore`](did_manager_src.DIDStore.md) |

## Properties

### authProvider

• **authProvider**: `AuthProvider`

___

### cache

• **cache**: [`LinkCache`](did_manager_src.LinkCache.md)

___

### ceramic

• **ceramic**: `CeramicApi`

___

### dataStore

• **dataStore**: `DIDDataStore`<`ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\>, `string`\>

___

### store

• **store**: [`DIDStore`](did_manager_src.DIDStore.md)

___

### threeIdProviders

• **threeIdProviders**: `Record`<`string`, `ThreeIdProvider`\>

## Methods

### \_addAuthMethod

▸ **_addAuthMethod**(`did`, `authSecretAdd`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |
| `authSecretAdd` | `Uint8Array` |

#### Returns

`Promise`<`void`\>

___

### \_addLink

▸ **_addLink**(`did`, `linkProof?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |
| `linkProof?` | ``null`` \| `LinkProof` |

#### Returns

`Promise`<`void`\>

___

### \_authCreate

▸ **_authCreate**(): `Promise`<`Uint8Array`\>

#### Returns

`Promise`<`Uint8Array`\>

___

### \_initIdentity

▸ **_initIdentity**(`config`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `AuthConfig` \| `SeedConfig` |

#### Returns

`Promise`<`string`\>

___

### addAuthAndLink

▸ **addAuthAndLink**(`did`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<`void`\>

___

### createAccount

▸ **createAccount**(`opts?`): `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | `Object` |
| `opts.legacyDid?` | `string` |
| `opts.skipMigration?` | `boolean` |

#### Returns

`Promise`<`string`\>

___

### didExist

▸ **didExist**(`did`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<`boolean`\>

___

### didProvider

▸ **didProvider**(`did`): `undefined` \| `DIDProvider`

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`undefined` \| `DIDProvider`

___

### linkInNetwork

▸ **linkInNetwork**(`accountId`): `Promise`<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `accountId` | `string` |

#### Returns

`Promise`<``null`` \| `string`\>

___

### listDIDS

▸ **listDIDS**(): `Promise`<`string`[]\>

#### Returns

`Promise`<`string`[]\>

___

### setDid

▸ **setDid**(`did`): `Promise`<`ThreeIdProvider`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<`ThreeIdProvider`\>

___

### setDidByAccountId

▸ **setDidByAccountId**(`accountId`): `Promise`<`ThreeIdProvider`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `accountId` | `string` |

#### Returns

`Promise`<`ThreeIdProvider`\>
