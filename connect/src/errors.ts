import { assertAs, createNamespaceError } from 'errors-utils'

export class ConnectError extends createNamespaceError('3IC') {}

export function assert(condition: boolean, code: number, message: string): asserts condition {
  return assertAs(condition, ConnectError, code, message)
}

assert.isDefined = function <T = unknown>(
  value: T,
  message: string
): asserts value is NonNullable<T> {
  return assert(value != null, 2, message)
}

assert.isString = function (
  value: unknown,
  message = 'Input must be a string'
): asserts value is string {
  return assert(typeof value === 'string', 3, message)
}
