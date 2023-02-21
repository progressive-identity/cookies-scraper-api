import { NextFunction, Request, Response } from 'express'
import { IAliasError } from '../utils/errors/IAliasError'
import { aliasLogger } from '../utils/logging/aliasLogger'
import apm from 'elastic-apm-node'
import { HttpControllerUtils } from '../controllers/HttpControllerUtils'
import { UnknownError } from '../utils/errors/UnknownError'

export default function (
  err: IAliasError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let error: IAliasError
  if (err instanceof Error) {
    error = new UnknownError(err)
  } else {
    error = err
  }

  // We capture the error for apm : https://www.elastic.co/guide/en/apm/agent/nodejs/3.x/custom-stack.html#custom-stack-error-logging
  apm.captureError(error.buildForLogger())
  aliasLogger.error(error.buildForLogger())
  HttpControllerUtils.sendErrorResponse(res, error.code, error.buildForApi())

  if (error.code === 500 && error.name === 'InternalError') {
    process.exit(1)
  }
}
