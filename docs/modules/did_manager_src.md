# Module: did-manager/src

## Classes

- [DIDStore](../classes/did_manager_src.DIDStore.md)
- [LinkCache](../classes/did_manager_src.LinkCache.md)
- [Manager](../classes/did_manager_src.Manager.md)
- [Migrate3IDV0](../classes/did_manager_src.Migrate3IDV0.md)

## Functions

### fetchJson

▸ `Const` **fetchJson**<`T`\>(`url`, `body?`): `Promise`<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `body?` | `Record`<`string`, `unknown`\> |

#### Returns

`Promise`<`T`\>

___

### jwtDecode

▸ `Const` **jwtDecode**<`T`\>(`jwt`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `jwt` | `string` |

#### Returns

`T`

___

### legacyDIDLinkExist

▸ `Const` **legacyDIDLinkExist**(`accountId`): `Promise`<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `accountId` | `string` |

#### Returns

`Promise`<``null`` \| `string`\>

___

### waitMS

▸ `Const` **waitMS**(`ms`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `ms` | `number` |

#### Returns

`Promise`<`void`\>

___

### willMigrationFail

▸ `Const` **willMigrationFail**(`accountId`, `did`): `Promise`<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `accountId` | `string` |
| `did` | `string` |

#### Returns

`Promise`<`boolean`\>
