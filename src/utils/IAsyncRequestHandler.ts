// FIXME we shouldn't have to do that
// https://stackoverflow.com/questions/65749916/what-is-the-correct-type-for-this-handler
import { NextFunction, Response } from 'express'

export interface IAsyncRequestHandler<Req> {
  (req: Req, res: Response, next: NextFunction): Promise<void>
}
