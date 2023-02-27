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

  /**
   * Fetch and return the cookies of a website.
   * @param url the url of the website
   * @param pagesNumber the number of pages we want to fetch
   */
  async getCookieInfos(url: string, pagesNumber = 5): Promise<GetByUrlResData> {
    const validUrl = new URL(url)
    aliasLogger.info(
      `Starting scrapping of cookies for : ${validUrl.toString()}`
    )
    let start = perf_hooks.performance.now()
    const links = await SitemapUtils.getLinks(validUrl, pagesNumber)
    let end = perf_hooks.performance.now()
    aliasLogger.info(`Getting links : ${end - start}ms`)

    start = perf_hooks.performance.now()
    const cookies = await this.extractCookies(validUrl, links)
    end = perf_hooks.performance.now()
    aliasLogger.info(
      `Extracting cookies (${cookies.length} found on ${pagesNumber} pages) : ${
        end - start
      }ms`
    )

    const sortedCookies = this.sortCookies(cookies, validUrl)

    return {
      url: url,
      pagesAnalyzed: links.length,
      firstPartyCookies: this.mapper.toEntityBulk(sortedCookies.firstParty),
      thirdPartyCookies: this.mapper.toEntityBulk(sortedCookies.thirdParty),
    }
  }

  /**
   * Extract the cookies from a list of urls.
   * @param url a URL (object) of the website
   * @param links the list of urls (string) we will fetch
   */
  async extractCookies(
    url: URL,
    links: string[]
  ): Promise<Protocol.Network.Cookie[]> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({ Referer: 'https://example.com' })
    await page.goto(url.origin, { waitUntil: 'networkidle2' })

    const cookies: Protocol.Network.Cookie[] = []
    cookies.push(...(await this.extractCookiesFromBrowser(page)))

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
   * Extract the cookies from the browser using {@link https://chromedevtools.github.io/devtools-protocol/tot/Storage/#method-getCookies}.
   * @param page an opened page from the puppeteer browser
   */
  private async extractCookiesFromBrowser(
    page: Page
  ): Promise<Protocol.Network.Cookie[]> {
    const client = await page.target().createCDPSession()
    return (await client.send('Storage.getCookies')).cookies
  }

  /**
   * Extract the cookies from pages using {@link https://pptr.dev/api/puppeteer.page.cookies}.
   * @param page
   * @param url
   */
  private async extractCookiesFromPage(
    page: Page,
    url: string
  ): Promise<Protocol.Network.Cookie[]> {
    await page.goto(url, { waitUntil: 'networkidle2' })
    return page.cookies()
  }

  /**
   * Filter the cookies into two categories, first party and third party. See the link below for more detail.
   * @param cookies the collection of cookies to sort
   * @param url a URL (object) of the website used to know the domain
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
