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
  // Ask user to continue with 3box account migration, true to
  // migrate, false to cancel request
  prompt_migration: async (ctx, params) => {
    //...
  },
   // Ask user to skip migration after migration faile, true to 
   // create new account, false to cancel request
  prompt_migration_skip: async (ctx, params) => {
    //...
  },
  // Known migration failure bugs, ask user to continue with new
  // account instead, true to create new, false to cancel request
  prompt_migration_fail: async (ctx, params) => {
    //...
  },
  // Ask user to connect account to existing account or create new.
  // Displayed when CAIP10 has no existing link in network.
  prompt_account: async (ctx, params) => {
    //...
  },
  // Permission request for app to access 3id-connect
  prompt_authenticate: async (ctx, params) => {
    //...
  },
  // Any errors during flows
  inform_error: async (ctx, params) => {
    //...
  },
  // Inform UI that a flow has ended and no futher requests are expected 
  inform_close: async (ctx, params) => {
    //...
  }
}

//Create a 3ID Connect UI Provider 
const provider = new UIProvider(UIMethods)

// TODO: provider consumption in other libraries
```

## Maintainers

[@zachferland](https://github.com/zachferland)
