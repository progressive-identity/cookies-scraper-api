import { defaultGenericErrorInfos } from './GenericErrorUtils'

export enum ProductErrorNames {
  InvalidDataError = 'InvalidDataError',
  InvalidEnumValueError = 'InvalidEnumValueError',
  MissingFieldError = 'MissingFieldError',
  DeletionNotPossible = 'DeletionNotPossible',
  UropaFormatError = 'UropaFormatError',
  InvalidPassword = 'InvalidPassword',
  AccessResourceError = 'AccessResourceError',
}

const defaultProductErrorInfos = defaultGenericErrorInfos

const productErrorsInfos = new Map<
  ProductErrorNames,
  { code: number; reason: string; status: string }
>([
  [
    ProductErrorNames.InvalidDataError,
    { code: 400, reason: 'A data is invalid', status: 'INVALID_DATA' },
  ],
  [
    ProductErrorNames.InvalidEnumValueError,
    {
      code: 400,
      reason: 'The value of a field is invalid',
      status: 'INVALID_DATA',
    },
  ],
  [
    ProductErrorNames.MissingFieldError,
    {
      code: 400,
      reason: 'A required field is missing',
      status: 'INVALID_DATA',
    },
  ],
  [
    ProductErrorNames.DeletionNotPossible,
    {
      code: 400,
      reason:
        'The deletion is not possible because this object is being used elsewhere',
      status: 'DELETION_NOT_POSSIBLE',
    },
  ],
  [
    ProductErrorNames.UropaFormatError,
    {
      code: 400,
      reason: 'There is an error in the format',
      status: 'WRONG_FORMAT',
    },
  ],
  [
    ProductErrorNames.InvalidPassword,
    {
      code: 400,
      reason: 'The password is not valid',
      status: 'INVALID_PASSWORD',
    },
  ],
  [
    ProductErrorNames.AccessResourceError,
    {
      code: 403,
      reason:
        "You can't access this resource, verify the information in the request",
      status: 'ACCESS_RESOURCE_ERROR',
    },
  ],
])

export default abstract class ProductErrorUtils {
  static getErrorInfosByName(name: ProductErrorNames): {
    code: number
    reason: string
    status: string
  } {
    return (
      productErrorsInfos.get(name) || {
        code: defaultProductErrorInfos.code,
        reason: defaultProductErrorInfos.reason,
        status: defaultProductErrorInfos.status,
      }
    )
  }
}
