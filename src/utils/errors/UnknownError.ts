import { AliasError } from './AliasError'
import GenericErrorUtils, { GenericErrorNames } from './types/GenericErrorUtils'

export class UnknownError extends AliasError {
  constructor(error: Error) {
    const { code, reason, status } = GenericErrorUtils.getErrorInfosByName(
      error.name as GenericErrorNames
    )
    super(code, error.name, status, reason)
    this.details = { error: error.message }
    this.additionalInformation = {
      stack: error.stack,
    }
  }

  static catchGenericError(err: unknown): void {
    if (err instanceof Error) {
      throw new UnknownError(err)
    }
  }
}
