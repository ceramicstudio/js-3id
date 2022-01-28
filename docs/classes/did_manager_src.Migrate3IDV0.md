# Class: Migrate3IDV0

[did-manager/src](../modules/did_manager_src.md).Migrate3IDV0

## Constructors

### constructor

• **new Migrate3IDV0**(`threeIdProvider`, `dataStore`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `threeIdProvider` | `DIDProvider` |
| `dataStore` | `DIDDataStore`<`ModelTypeAliases`<`Record`<`string`, `any`\>, `Record`<`string`, `string`\>, `Record`<`string`, `string`\>\>, `string`\> |

## Methods

### \_githubVerify

▸ **_githubVerify**(`did`, `profile`): `Promise`<``null`` \| `Account`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |
| `profile` | `any` |

#### Returns

`Promise`<``null`` \| `Account`\>

___

### \_twitterVerify

▸ **_twitterVerify**(`did`, `profile`): `Promise`<``null`` \| `Account`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |
| `profile` | `any` |

#### Returns

`Promise`<``null`` \| `Account`\>

___

### migrate3BoxProfile

▸ **migrate3BoxProfile**(`did`): `Promise`<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |

#### Returns

`Promise`<`any`\>

___

### migrateAKALinks

▸ **migrateAKALinks**(`did`, `profile?`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `did` | `string` |
| `profile` | `any` |

#### Returns

`Promise`<`void`\>

___

### userDIDAuthenticated

▸ **userDIDAuthenticated**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

___

### legacySeedCreate

▸ `Static` **legacySeedCreate**(`authProvider`): `Promise`<`Uint8Array`\>

 Creates a legacy 3Box root seed

#### Parameters

| Name | Type |
| :------ | :------ |
| `authProvider` | `AuthProvider` |

#### Returns

`Promise`<`Uint8Array`\>
