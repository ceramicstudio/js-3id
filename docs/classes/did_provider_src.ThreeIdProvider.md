# Class: ThreeIdProvider

[did-provider/src](../modules/did_provider_src.md).ThreeIdProvider

## Constructors

### constructor

• **new ThreeIdProvider**(`threeIdx`, `permissions`, `keychain`)

Use ThreeIdProvider.create() to create an ThreeIdProvider instance

#### Parameters

| Name | Type |
| :------ | :------ |
| `threeIdx` | `ThreeIDX` |
| `permissions` | `Permissions` |
| `keychain` | `Keychain` |

## Accessors

### id

• `get` **id**(): `string`

**`property`** {string} id                 The DID of the ThreeIdProvider instance

#### Returns

`string`

___

### keychain

• `get` **keychain**(): `Keychain`

**`property`** {Keychain} keychain          Edit the keychain

#### Returns

`Keychain`

___

### permissions

• `get` **permissions**(): `Permissions`

**`property`** {Permissions} permissions    Edit permissions

#### Returns

`Permissions`

## Methods

### attachDIDProvider

▸ **attachDIDProvider**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

___

### getDidProvider

▸ **getDidProvider**(`forcedOrigin?`): `DidProvider`

Get the DIDProvider

#### Parameters

| Name | Type |
| :------ | :------ |
| `forcedOrigin?` | `string` |

#### Returns

`DidProvider`

The DIDProvider for this ThreeIdProvider instance

___

### create

▸ `Static` **create**(`config`): `Promise`<[`ThreeIdProvider`](did_provider_src.ThreeIdProvider.md)\>

Creates an instance of ThreeIdProvider

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | `ThreeIdProviderConfig` | The configuration to be used |

#### Returns

`Promise`<[`ThreeIdProvider`](did_provider_src.ThreeIdProvider.md)\>

An ThreeIdProvider instance
