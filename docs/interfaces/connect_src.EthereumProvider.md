# Interface: EthereumProvider

[connect/src](../modules/connect_src.md).EthereumProvider

## Hierarchy

- `EventEmitter`

  ↳ **`EthereumProvider`**

## Methods

### on

▸ **on**(`event`, `listener`): [`EthereumProvider`](connect_src.EthereumProvider.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"connect"`` |
| `listener` | (`connectInfo`: [`ProviderConnectInfo`](connect_src.ProviderConnectInfo.md)) => `void` |

#### Returns

[`EthereumProvider`](connect_src.EthereumProvider.md)

#### Overrides

NodeJS.EventEmitter.on

▸ **on**(`event`, `listener`): [`EthereumProvider`](connect_src.EthereumProvider.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"disconnect"`` |
| `listener` | (`error`: [`ProviderRpcError`](connect_src.ProviderRpcError.md)) => `void` |

#### Returns

[`EthereumProvider`](connect_src.EthereumProvider.md)

#### Overrides

NodeJS.EventEmitter.on

▸ **on**(`event`, `listener`): [`EthereumProvider`](connect_src.EthereumProvider.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"chainChanged"`` |
| `listener` | (`chainId`: `string`) => `void` |

#### Returns

[`EthereumProvider`](connect_src.EthereumProvider.md)

#### Overrides

NodeJS.EventEmitter.on

▸ **on**(`event`, `listener`): [`EthereumProvider`](connect_src.EthereumProvider.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"accountsChanged"`` |
| `listener` | (`accounts`: `string`[]) => `void` |

#### Returns

[`EthereumProvider`](connect_src.EthereumProvider.md)

#### Overrides

NodeJS.EventEmitter.on

▸ **on**(`event`, `listener`): [`EthereumProvider`](connect_src.EthereumProvider.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"message"`` |
| `listener` | (`message`: [`ProviderMessage`](connect_src.ProviderMessage.md)) => `void` |

#### Returns

[`EthereumProvider`](connect_src.EthereumProvider.md)

#### Overrides

NodeJS.EventEmitter.on

___

### request

▸ **request**<`T`\>(`args`): `Promise`<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `unknown` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | [`RequestArguments`](connect_src.RequestArguments.md) |

#### Returns

`Promise`<`T`\>
