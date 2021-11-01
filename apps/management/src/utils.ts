/** @internal */
export type Deferred<T> = Promise<T> & {
    resolve: (value?: T | PromiseLike<T>) => void
    reject: (reason?: any) => void
  }
  
  /** @internal */
  export function deferred<T>(): Deferred<T> {
    let methods
    const promise = new Promise<T>((resolve, reject): void => {
      methods = { resolve, reject }
    })
    return Object.assign(promise, methods) as Deferred<T>
  }
  