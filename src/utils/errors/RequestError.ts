import { AliasError } from './AliasError'
import GenericErrorUtils, { GenericErrorNames } from './types/GenericErrorUtils'

export class RequestError extends AliasError {
  constructor(name: GenericErrorNames, details: object | object[] = {}) {
    const { code, reason, status } = GenericErrorUtils.getErrorInfosByName(name)
    super(code, name, status, reason, details)
  }
}
