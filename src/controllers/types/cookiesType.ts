import { operations } from '../../../types/cookies-scraper.openapi-types'
import { FastifyRequest } from 'fastify'

// TODO: try to use the --path-params-as-types option to fetch the paths
// https://www.npmjs.com/package/openapi-typescript
export type GetByUrlReq = FastifyRequest<{
  Querystring: operations['getCookies']['parameters']['query']
}>

export type GetByUrlResData =
  operations['getCookies']['responses']['200']['content']['application/json']['data']
