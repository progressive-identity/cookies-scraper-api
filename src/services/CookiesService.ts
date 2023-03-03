import { Page, Protocol, TimeoutError } from 'puppeteer'
import { GetByUrlResData } from '../controllers/types/cookiesType'
import { CookieInfoMapper } from './mappers/api/CookieInfoMapper'
import { ArrayUtils } from '../utils/ArrayUtils'
import perf_hooks from 'perf_hooks'
import { aliasLogger } from '../utils/logging/aliasLogger'
import { SitemapUtils } from '../utils/SitemapUtils'
import { BrowserUtils } from '../utils/BrowserUtils'

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
   * Try to auto-accept the cookie banner to get all the cookies
   * @param page the page on which to accept the cookie banner
   */
  async acceptCookieBanner(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'))
        const acceptButtons = buttons.filter((button) =>
          button.innerText.match(/accept/gi)
        )
        if (acceptButtons.length > 0) {
          acceptButtons.forEach((button) => button.click())
        }
      })
      // Needed to wait for the cookies to load
      // Needed to leave some time to the consent-o-matic extension to work
      await page.waitForNetworkIdle({ idleTime: 3000 })
    } catch (err) {
      // FIXME There seems to be a TimeoutError on some sites (like amazon.fr)
      if (err instanceof TimeoutError) {
        aliasLogger.error({
          type: 'timeoutCookieBanner',
          url: page.url(),
          error: { ...err },
        })
      } else {
        throw err
      }
    }
  }

  /**
   * Extract the cookies from a list of urls. Use an existing instance of a virtual browser.
   * @param url a URL (object) of the website
   * @param links the list of urls (string) we will fetch
   * @see {@link BrowserUtils.startBrowser}
   */
  async extractCookies(
    url: URL,
    links: string[]
  ): Promise<Protocol.Network.Cookie[]> {
    // We use a browser with some extensions already loaded and configured
    const page = await BrowserUtils.puppeteerBrowser.newPage()
    await page.setExtraHTTPHeaders({ Referer: 'https://example.com' })
    await page.goto(url.origin, { waitUntil: 'networkidle0' })

    await this.acceptCookieBanner(page)

    const cookies: Protocol.Network.Cookie[] = []
    cookies.push(...(await this.extractCookiesFromBrowser(page)))
    cookies.push(...(await page.cookies(...links)))

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
