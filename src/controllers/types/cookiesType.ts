import { Request } from 'express'
import { operations } from '../../../types/cookies-scraper.openapi-types'
import { ParamsDictionary } from 'express-serve-static-core'

// TODO: try to use the --path-params-as-types option to fetch the paths
// https://www.npmjs.com/package/openapi-typescript
export type GetByUrlReq = Request<
  ParamsDictionary,
  unknown,
  unknown,
  operations['getCookies']['parameters']['query']
>

export type GetByUrlResData =
  operations['getCookies']['responses']['200']['content']['application/json']['data']
