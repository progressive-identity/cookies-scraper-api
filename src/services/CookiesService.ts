import puppeteer, { Page, Protocol } from 'puppeteer'
import { GetByUrlResData } from '../controllers/types/cookiesType'
import { CookieInfoMapper } from './mappers/api/CookieInfoMapper'
import { ArrayUtils } from '../utils/ArrayUtils'
import { SitemapUtils } from '../utils/SitemapUtils'
import perf_hooks from 'perf_hooks'
import { aliasLogger } from '../utils/logging/aliasLogger'

export class CookiesService {
  readonly mapper

  constructor() {
    this.mapper = new CookieInfoMapper()
  }

  async getCookieInfos(url: string): Promise<GetByUrlResData> {
    const validUrl = new URL(url)
    aliasLogger.info(
      `Starting scrapping of cookies for : ${validUrl.toString()}`
    )
    let start = perf_hooks.performance.now()
    const links = await SitemapUtils.getLinks(validUrl)
    let end = perf_hooks.performance.now()
    aliasLogger.info(`Getting links : ${end - start}ms`)

    start = perf_hooks.performance.now()
    const cookies = await this.extractCookies(validUrl, links)
    end = perf_hooks.performance.now()
    aliasLogger.info(
      `Extracting cookies (${cookies.length} found) : ${end - start}ms`
    )

    const sortedCookies = this.sortCookies(cookies, validUrl)

    return {
      url: url,
      pagesAnalyzed: links.length,
      firstPartyCookies: this.mapper.toEntityBulk(sortedCookies.firstParty),
      thirdPartyCookies: this.mapper.toEntityBulk(sortedCookies.thirdParty),
    }
  }

  async extractCookies(
    url: URL,
    links: string[]
  ): Promise<Protocol.Network.Cookie[]> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({ Referer: 'https://example.com' })
    await page.goto(url.origin, { waitUntil: 'networkidle2' })

    const cookies: Protocol.Network.Cookie[] = []
    cookies.push(...(await this.extractCookiesFromWebsite(page)))

    for (const link of links) {
      await this.extractCookiesFromPage(page, link)
    }
    // FIXME Promise.all should be better but doesn't seems to work
    // await Promise.all(links.map(async (link) => {
    //     await this.extractCookiesFromPage(page, link)
    // }))

    await browser.close()

    return cookies
  }

  /**
   * TODO
   * @param page
   * @private
   */
  private async extractCookiesFromWebsite(
    page: Page
  ): Promise<Protocol.Network.Cookie[]> {
    const client = await page.target().createCDPSession()
    return (await client.send('Network.getAllCookies')).cookies
  }

  /**
   * TODO
   * @param page
   * @param url
   * @private
   */
  private async extractCookiesFromPage(
    page: Page,
    url: string
  ): Promise<Protocol.Network.Cookie[]> {
    await page.goto(url, { waitUntil: 'networkidle2' })
    return page.cookies()
  }

  /**
   * TODO
   * @param cookies
   * @param url
   * @see {@link https://docs.oracle.com/en/cloud/saas/marketing/eloqua-user/Help/EloquaAsynchronousTrackingScripts/Tasks/BasicPageTrackingFirst.htm#}
   */
  sortCookies(
    cookies: Protocol.Network.Cookie[],
    url: URL
  ): {
    firstParty: Protocol.Network.Cookie[]
    thirdParty: Protocol.Network.Cookie[]
  } {
    const sortedCookies = {
      firstParty: [] as Protocol.Network.Cookie[],
      thirdParty: [] as Protocol.Network.Cookie[],
    }

    // We extract the domain
    let domain = url.hostname
    if (domain.startsWith('www.')) {
      domain = domain.replace('www.', '')
    }

    cookies = ArrayUtils.removeDuplicate<Protocol.Network.Cookie>(cookies)
    cookies.map((cookie) => {
      if (cookie.domain.includes(domain)) {
        sortedCookies.firstParty.push(cookie)
      } else {
        sortedCookies.thirdParty.push(cookie)
      }
    })

    return sortedCookies
  }
}
