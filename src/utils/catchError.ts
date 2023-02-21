import { IAsyncRequestHandler } from './IAsyncRequestHandler'
import { UnknownError } from './errors/UnknownError'
import { NextFunction, Response } from 'express'

export function catchError<Req>(controller: IAsyncRequestHandler<Req>) {
  return function (req: Req, res: Response, next: NextFunction) {
    controller(req, res, next)
      .catch((err: Error) => {
        console.log(err)
        UnknownError.catchGenericError(err)
        throw err
      })
      .catch((err: Error) => {
        next(err)
      })
  }
}
