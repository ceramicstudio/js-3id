declare module 'postmsg-rpc' {
  interface Exports {
    caller<A extends Array<unknown>, R>(
        funcName: string,
        opts: any
    ): (...args: A) => Promise<R>
    expose<T extends (...args: Array<any>) => any | Promise<any>>(
        funcName: string,
        func: T,
        opts: any
    ): { close: () => void }
  }

  export default Exports
}
