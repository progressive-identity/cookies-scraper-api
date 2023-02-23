import { HttpControllerUtils } from './HttpControllerUtils'
import { Response } from 'express'
import { CookiesService } from '../services/CookiesService'
import { GetByUrlReq, GetByUrlResData } from './types/cookiesType'

export class CookiesController {
  getByUrl = async (req: GetByUrlReq, res: Response): Promise<void> => {
    const cookiesService = new CookiesService()

    const { url } = req.query

    const cookies = await cookiesService.getCookieInfos(url)

    HttpControllerUtils.sendGetResponse<GetByUrlResData>(res, cookies)
  }
}
