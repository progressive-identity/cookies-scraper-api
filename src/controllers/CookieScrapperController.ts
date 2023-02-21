import {HttpControllerUtils} from './HttpControllerUtils'
import {HttpController} from './HttpController'
import {Request, Response} from "express";

export class CookieScrapperController
  implements
    HttpController<unknown, unknown, unknown, unknown, unknown>
{

  constructor(
  ) {
  }
  create = async (req: Request, res: Response): Promise<void> => {


    HttpControllerUtils.sendPostResponse<{}>(
      res,
        {}
    )
  }
}
