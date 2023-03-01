import puppeteer, { Page, Protocol } from 'puppeteer'
import { GetByUrlResData } from '../controllers/types/cookiesType'
import { CookieInfoMapper } from './mappers/api/CookieInfoMapper'
import { ArrayUtils } from '../utils/ArrayUtils'
import perf_hooks from 'perf_hooks'
import { aliasLogger } from '../utils/logging/aliasLogger'
import path from 'path'
import { SitemapUtils } from '../utils/SitemapUtils'

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
  async getCookieInfos(
    url: string,
    pagesNumber?: number
  ): Promise<GetByUrlResData> {
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
      `Extracting cookies (${cookies.length} found on ${
        links.length
      } pages) : ${end - start}ms`
    )

    const sortedCookies = this.sortCookies(cookies, validUrl)

    return {
      url: url,
      pagesAnalyzed: links.length,
      firstPartyCookies: ArrayUtils.removeDuplicate(
        this.mapper.toEntityBulk(sortedCookies.firstParty)
      ),
      thirdPartyCookies: ArrayUtils.removeDuplicate(
        this.mapper.toEntityBulk(sortedCookies.thirdParty)
      ),
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
    const pathToExtension = path.join(process.cwd(), 'consent')

    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    })

    const page = await browser.newPage()
    await page.goto(
      'chrome-extension://mdjildafknihdffpkfmmpnpoiajfjnjd/options.html'
    )

    await page.$$eval('ul.categorylist li', (els) =>
      els.forEach((el) => el.click())
    )
    await page.setExtraHTTPHeaders({ Referer: 'https://example.com' })
    await page.goto(url.origin, { waitUntil: 'networkidle0' })

    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))
    await delay(5000)

    const cookies: Protocol.Network.Cookie[] = []
    cookies.push(...(await this.extractCookiesFromBrowser(page)))
    cookies.push(...(await page.cookies(...links)))

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
