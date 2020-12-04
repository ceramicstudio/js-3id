declare module 'postmsg-rpc' {
  export function caller<A extends Array<unknown>, R>(
    funcName: string,
    opts: any
  ): (...args: A) => Promise<R>
  export function expose<T extends (...args: Array<any>) => any | Promise<any>>(
    funcName: string,
    func: T,
    opts: any
  ): { close: () => void }
}
