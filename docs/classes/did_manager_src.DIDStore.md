# Class: DIDStore

[did-manager/src](../modules/did_manager_src.md).DIDStore

## Constructors

### constructor

• **new DIDStore**(`db?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `db?` | `StoreJsAPI` |

## Properties

### store

• **store**: `StoreJsAPI`

## Methods

### getDIDs

▸ **getDIDs**(): `Promise`<`string`[]\>

#### Returns

`Promise`<`string`[]\>

___

### getStoredDID

▸ **getStoredDID**(`did`): `Promise`<``null`` \| `Uint8Array`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<``null`` \| `Uint8Array`\>

___

### storeDID

▸ **storeDID**(`did`, `seed`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |
| `seed` | `Uint8Array` |

#### Returns

`Promise`<`void`\>
