import { HttpControllerUtils } from './HttpControllerUtils'
import { CookiesService } from '../services/CookiesService'
import { GetByUrlReq, GetByUrlResData } from './types/cookiesType'
import { FastifyReply } from 'fastify'

export class CookiesController {
  getByUrl = async (req: GetByUrlReq, res: FastifyReply): Promise<void> => {
    const cookiesService = new CookiesService()

    // TODO improves typing to avoid having to disable warning
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const { url, pagesNumber } = req.query

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const cookies = await cookiesService.getCookieInfos(url, pagesNumber)

    void HttpControllerUtils.sendGetResponse<GetByUrlResData>(res, cookies)
  }
}
