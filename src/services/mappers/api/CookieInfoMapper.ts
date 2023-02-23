import { AbstractMapper } from '../AbstractMapper'
import { external } from '../../../../types/cookies-scraper.openapi-types'
import { Protocol } from 'puppeteer'

export type CookieInfo = external['components/schemas/CookieInfo.json']

export class CookieInfoMapper extends AbstractMapper<
  Protocol.Network.Cookie,
  CookieInfo
> {
  toEntity(entity: Protocol.Network.Cookie): CookieInfo {
    return {
      name: entity.name,
      value: entity.value,
      duration: entity.expires,
      domain: entity.domain,
    }
  }
}
