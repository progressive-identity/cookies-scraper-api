import { NextFunction, Request, Response } from 'express'
import { IAliasError } from '../utils/errors/IAliasError'
import { aliasLogger } from '../utils/logging/aliasLogger'
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

  aliasLogger.error(error.buildForLogger())
  HttpControllerUtils.sendErrorResponse(res, error.code, error.buildForApi())

  if (error.code === 500 && error.name === 'InternalError') {
    process.exit(1)
  }
}
