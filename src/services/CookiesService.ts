import puppeteer, { Page, Protocol } from 'puppeteer'
import { GetByUrlResData } from '../controllers/types/cookiesType'
import { CookieInfoMapper } from './mappers/api/CookieInfoMapper'
import { ArrayUtils } from '../utils/ArrayUtils'
import { SitemapUtils } from '../utils/SitemapUtils'

export class CookiesService {
  readonly mapper

  constructor() {
    this.mapper = new CookieInfoMapper()
  }

  async getCookieInfos(url: string): Promise<GetByUrlResData> {
    // TODO: find the sitemap url automatically
    // TODO: recursively interrogate the sitemap when the sitemap only reference other sitemaps
    // TODO(later): add the possibility to select how many page to check for the cookies
    // TODO: maybe fetch 50% of the page in the limit of 100 pages
    // TODO: test a message queue (rabbitMQ ?) because this function will be slow
    // TODO: find a way to classify the cookies
    // TODO: fetch the root url by default (important)

    const cookies = await this.extractCookies(new URL(url))

    let domain = new URL(url).hostname

    if (domain.startsWith('www.')) {
      domain = domain.replace('www.', '')
    }

    const sortedCookies = this.sortCookies(cookies, domain)

    return {
      url: url,
      pagesAnalyzed: 1,
      firstPartyCookies: this.mapper.toEntityBulk(sortedCookies.firstParty),
      thirdPartyCookies: this.mapper.toEntityBulk(sortedCookies.thirdParty),
    }
  }

  async extractCookies(url: URL): Promise<Protocol.Network.Cookie[]> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({ Referer: 'https://example.com' })
    await page.goto(url.origin, { waitUntil: 'networkidle2' })

    const cookies: Protocol.Network.Cookie[] = []
    cookies.push(...(await this.extractCookiesFromWebsite(page)))

    const links = SitemapUtils.getLinks(url)
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
   * @param domain
   */
  sortCookies(
    cookies: Protocol.Network.Cookie[],
    domain: string
  ): {
    firstParty: Protocol.Network.Cookie[]
    thirdParty: Protocol.Network.Cookie[]
  } {
    const sortedCookies = {
      firstParty: [] as Protocol.Network.Cookie[],
      thirdParty: [] as Protocol.Network.Cookie[],
    }

    ArrayUtils.removeDuplicate<Protocol.Network.Cookie>(cookies).map(
      (cookie) => {
        if (cookie.domain.includes(domain)) {
          sortedCookies.firstParty.push(cookie)
        } else {
          sortedCookies.thirdParty.push(cookie)
        }
      }
    )

    return sortedCookies
  }
}
