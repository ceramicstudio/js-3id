# Class: LinkCache

[did-manager/src](../modules/did_manager_src.md).LinkCache

## Constructors

### constructor

• **new LinkCache**(`db?`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `db?` | `StoreJsAPI` |

## Properties

### store

• **store**: `StoreJsAPI`

## Methods

### getLinkedAccounts

▸ **getLinkedAccounts**(): `Promise`<``null`` \| `string`[]\>

#### Returns

`Promise`<``null`` \| `string`[]\>

___

### getLinkedDid

▸ **getLinkedDid**(`accountId`): `Promise`<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `accountId` | `string` |

#### Returns

`Promise`<``null`` \| `string`\>

___

### setLinkedDid

▸ **setLinkedDid**(`accountId`, `did`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `accountId` | `string` |
| `did` | `string` |

#### Returns

`Promise`<`void`\>
