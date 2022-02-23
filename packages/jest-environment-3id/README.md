# jest-environment-3id

3ID environment for Jest, using Ceramic with a 3ID resolver and deployed datamodel.

## Installation

```sh
npm install -D jest-environment-3id
```

## Jest configuration

Set `jest-environment-3id` as Jest `testEnvironment`

## Injected globals

- `ceramic`: Ceramic core instance (from `jest-environment-ceramic`)
- `ipfs`: IPFS instance (from `jest-environment-ceramic`)
- `modelAliases`: deployed datamodel aliases

## License

Apache-2.0 OR MIT
