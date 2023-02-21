import { AliasError } from './AliasError'

export class ConnectError extends AliasError {
  constructor(
    code: number,
    name: string,
    status: string,
    reason: string,
    details: object | object[] = {}
  ) {
    super(code, name, status, reason, details)
  }
}
