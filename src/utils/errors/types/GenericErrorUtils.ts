export enum GenericErrorNames {
  BadRequest = 'BadRequest',
  InternalError = 'InternalError',
  InvalidResponseError = 'InvalidResponseError',
  MethodNotAllowed = 'MethodNotAllowed',
  NotFound = 'NotFound',
  RequestTimeout = 'RequestTimeout',
  ServiceUnavailable = 'ServiceUnavailable',
  Unauthorized = 'Unauthorized',
  CorsRequestBlocked = 'CorsRequestBlocked',
}

export const defaultGenericErrorInfos = Object.freeze({
  code: 500,
  reason: 'Internal Error',
  status: 'INTERNAL_ERROR',
})

const genericErrorsInfos = new Map<
  GenericErrorNames,
  {
    code: number
    reason: string
    status: string
  }
>([
  [
    GenericErrorNames.BadRequest,
    {
      code: 400,
      reason: 'Bad Request',
      status: 'BAD_REQUEST',
    },
  ],
  [
    GenericErrorNames.InternalError,
    {
      code: defaultGenericErrorInfos.code,
      reason: defaultGenericErrorInfos.reason,
      status: defaultGenericErrorInfos.status,
    },
  ],
  [
    GenericErrorNames.InvalidResponseError,
    {
      code: 500,
      reason: 'Invalid Response',
      status: 'INVALID_RESPONSE',
    },
  ],
  [
    GenericErrorNames.MethodNotAllowed,
    {
      code: 405,
      reason: 'Method not allowed',
      status: 'METHOD_NOT_ALLOWED',
    },
  ],
  [
    GenericErrorNames.NotFound,
    {
      code: 404,
      reason: 'Not Found',
      status: 'NOT_FOUND',
    },
  ],
  [
    GenericErrorNames.RequestTimeout,
    {
      code: 408,
      reason: 'Request Timeout',
      status: 'REQUEST_TIMEOUT',
    },
  ],
  [
    GenericErrorNames.ServiceUnavailable,
    {
      code: 503,
      reason: 'Service Unavailable',
      status: 'SERVICE_UNAVAILABLE',
    },
  ],
  [
    GenericErrorNames.CorsRequestBlocked,
    {
      code: 401,
      reason: 'CorsRequestBlocked',
      status: 'CORS_REQUEST_BLOCKED',
    },
  ],
  [
    GenericErrorNames.Unauthorized,
    {
      code: 401,
      reason: 'Unauthorized',
      status: 'UNAUTHORIZED',
    },
  ],
])

export default abstract class GenericErrorUtils {
  static getErrorInfosByName(name: GenericErrorNames): {
    code: number
    reason: string
    status: string
  } {
    return (
      genericErrorsInfos.get(name) || {
        code: defaultGenericErrorInfos.code,
        reason: defaultGenericErrorInfos.reason,
        status: defaultGenericErrorInfos.status,
      }
    )
  }

  static getErrorNameByCode(code: number): GenericErrorNames {
    let errorName = GenericErrorNames.InternalError
    if (code === defaultGenericErrorInfos.code) {
      return errorName
    }

    for (const [name, infos] of genericErrorsInfos.entries()) {
      if (infos.code === code) errorName = name
    }

    return errorName
  }
}
