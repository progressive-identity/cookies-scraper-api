import { Response } from 'express'

type GeneralDetailsResData = Record<string, unknown> | Record<string, unknown>[]

/**
 * TODO
 */
export abstract class HttpControllerUtils {
  /**
   * TODO
   * @param res
   * @param data
   */
  static sendGetResponse<ResData extends GeneralDetailsResData>(
    res: Response,
    data: ResData
  ) {
    const code = 200
    // TODO add link things like hateos, see what was done below
    // 	const data = prepareResponseData(originalUrl, entity, { nestedLinks: false })
    return this.sendResponse(res, code, data)
  }

  /**
   * TODO
   * @param res
   * @param data
   */
  static sendPostResponse<ResData extends GeneralDetailsResData>(
    res: Response,
    data: ResData
  ) {
    const code = 201
    return this.sendResponse(res, code, data)
  }

  /**
   * TODO
   * @param res
   * @param data
   */
  static sendPutResponse<ResData extends GeneralDetailsResData>(
    res: Response,
    data: ResData
  ) {
    const code = 201
    return this.sendResponse(res, code, data)
  }

  /**
   * TODO
   * @param res
   * @param code
   * @param data
   */
  //TODO handle GeneralError type with error status ENUM
  static sendErrorResponse(res: Response, code = 500, data: object = {}) {
    return this.sendResponse(res, code, data)
  }

  static getHttpCodes() {
    return {
      get: 200,
      create: 201,
      update: 201,
      attach: 204,
      delete: 204,
      error: 400,
    }
  }

  private static sendResponse(res: Response, code: number, data: object = {}) {
    return res.status(code).send({
      code,
      data,
    })
  }
}
