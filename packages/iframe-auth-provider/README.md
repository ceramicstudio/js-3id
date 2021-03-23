# TransportSubject

Message-based communication transport as a [RxJS Subject](https://rxjs.dev/api/index/class/Subject)

## Installation

```sh
npm install @ceramicnetwork/transport-subject
```

## Usage

```ts
import { TransportSubject } from '@ceramicnetwork/transport-subject'
import { Subscriber, interval } from 'rxjs'
import { map } from 'rxjs'

type Message = { type: string }

class MyTransport extends TransportSubject<Message> {
  constructor(time = 1000) {
    const source = interval(time).map(() => ({ type: 'ping' }))
    const sink = new Subscriber((message) => {
      console.log('send message', message)
    })
    super(source, sink)
  }
}

const transport = new MyTransport()
transport.subscribe((message) => {
  console.log('received message', message)
})
transport.next({ type: 'pong' })
```

## Types

### Wrapped

```ts
type Wrapped<Message, Namespace extends string> = { __tw: true; msg: Message; ns: Namespace }
```

### Wrapper

```ts
type Wrapper<MsgIn, MsgOut, WrappedOut> = {
  wrap: (msg: MsgOut) => WrappedOut
  unwrap: (input: any) => MsgIn
}
```

### UnwrapOperatorOptions

```ts
type UnwrapOperatorOptions = {
  onInvalidInput?: (input: unknown, error: Error) => void
  throwWhenInvalid?: boolean
}
```

## API

### TransportSubject class

Extends [RxJS Subject class](https://rxjs.dev/api/index/class/Subject)

**Type parameters**

1. `MsgIn`: the type of the messages coming in from the `source`
1. `MsgOut = MsgIn`: the type of the messages going out to the `sink`

#### new TransportSubject()

**Arguments**

1. [`source: Observable<MsgIn>`](https://rxjs.dev/api/index/class/Observable)
1. [`sink: Observer<MsgOut>`](https://rxjs.dev/api/index/interface/Observer)

#### .next()

**Arguments**

1. `message: MsgOut`

**Returns** `void`

### createWrap()

**Type parameters**

1. `MsgOut`
1. `Namespace extends string = string`

**Arguments**

1. `namespace: Namespace`

**Returns** `(msg: MsgOut) => Wrapped<MsgOut, Namespace>`, see [Wrapped](#wrapped) type

### createUnwrap()

**Type parameters**

1. `MsgIn`
1. `Namespace extends string = string`

**Arguments**

1. `namespace: Namespace`

**Returns** `(input: any) => MsgIn`

### createWrapper()

Combines [`createWrap()`](#createwrap) and [`createUnwrap()`](#createunwrap)

**Type parameters**

1. `MsgIn`: the type of the messages coming in from the returned transport
1. `MsgOut = MsgIn`: the type of the messages pushed to the returned transport
1. `Namespace extends string = string`

**Arguments**

1. `namespace: Namespace`

**Returns** `Wrapper<MsgIn, MsgOut, Wrapped<MsgOut, Namespace>>`, see [Wrapper](#wrapper) and [Wrapped](#wrapped) types

### createUnwrapOperator()

**Type parameters**

1. `WrappedIn`: the type of the messages coming in from the input `source`
1. `MsgIn`: the type of the messages coming in from the returned observable

**Arguments**

1. `unwrap: (input: any) => MsgIn`
1. [`options?: UnwrapOperatorOptions = {}`](#unwrapoperatoroptions)

**Returns** `OperatorFunction<WrappedIn, MsgIn>`

### createWrapObserver()

**Type parameters**

1. `MsgOut`: the type of the messages pushed to the returned observer
1. `WrappedOut`: the type of the messages going out to the input `sink`

**Arguments**

1. `sink: Observer<WrappedOut>`
1. `wrap: (msg: MsgOut) => WrappedOut`

**Returns** `Observer<MsgOut>`

### createWrappedTransport()

Combines [`createUnwrapObservable()`](#createunwrapobservable) and [`createWrapObserver()`](#createwrapobserver) in a [`TransportSubject`](#transportsubject-class)

**Type parameters**

1. `MsgIn`: the type of the messages coming in from the returned transport
1. `MsgOut`: the type of the messages pushed to the returned transport
1. `WrappedIn`: the type of the messages coming in from the input `transport` source
1. `WrappedOut = WrappedIn`: the type of the messages going out to the input `transport` sink

**Arguments**

1. [`transport: TransportSubject<WrappedIn, WrappedOut>`](#transportsubject-class)
1. [`wrapper: MessageWrapper<MsgIn, MsgOut, WrappedOut>`](#messagewrapper)
1. [`options?: UnwrapObservableOptions = {}`](#unwrapobservableoptions)

**Returns** [`TransportSubject<MsgIn, MsgOut>`](#transportsubject-class)

### createNamepacedTransport()

Combines [`createWrappedTransport()`](#createwrappedtransport) and [`createWrapper()`](#createwrapper)

**Type parameters**

1. `MsgIn`: the type of the messages coming in from the returned transport
1. `MsgOut = MsgIn`: the type of the messages pushed to the returned transport
1. `Namespace extends string = string`

**Arguments**

1. `transport TransportSubject<Wrapped<MsgIn, Namespace>, Wrapped<MsgOut, Namespace>>>`
1. `namespace: Namespace`
1. [`options?: UnwrapOperatorOptions = {}`](#unwrapoperatoroptions)

**Returns** [`TransportSubject<MsgIn, MsgOut>`](#transportsubject-class)

## License

Apache-2.0 OR MIT
