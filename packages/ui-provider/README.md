# <a name="intro"></a> 3ID Connect Service UI Provider

An interface for applications to impelement any user interface 3ID connect service.


NOTE: Mostly internal use, names and interfaces are likely to change soon and support currently being added in the 3ID Connect Service and/or 3ID Manager Library

## <a name="use"></a> Use

```
npm install @ceramicstudio/ui-provider
```

Example usage:

```js
import { UIProvider, ThreeIDManagerUI } from '@ceramicstudio/ui-provider'

// Implement the following UI Handlers 
const UIMethods: UIProviderHandlers = {
  prompt_migration: async (ctx, params) => {
    //...
  },
  prompt_migration_skip: async (ctx, params) => {
    //...
  },
  prompt_migration_fail: async (ctx, params) => {
    //...
  },
  prompt_account: async (ctx, params) => {
    //...
  },
  prompt_authenticate: async (ctx, params) => {
    //...
  },
  inform_error: async (ctx, params) => {
    //...
  }
}

//Create a 3ID Connect UI Provider 
const provider = new UIProvider(UIMethods)

// TODO: provider consumption in other libraries
```

## Maintainers

[@zachferland](https://github.com/zachferland)
