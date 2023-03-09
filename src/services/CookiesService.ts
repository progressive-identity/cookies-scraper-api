import { Page, Protocol, TimeoutError } from 'puppeteer'
import { GetByUrlResData } from '../controllers/types/cookiesType'
import { CookieInfo, CookieInfoMapper } from './mappers/api/CookieInfoMapper'
import { ArrayUtils } from '../utils/ArrayUtils'
import perf_hooks from 'perf_hooks'
import { aliasLogger } from '../utils/logging/aliasLogger'
import { SitemapUtils } from '../utils/SitemapUtils'
import { BrowserUtils } from '../utils/BrowserUtils'
import path from 'path'
import fs from 'fs/promises'

type UrlInfos = { full: string; domain: string }

export class CookiesService {
  readonly mapper

  constructor() {
    this.mapper = new CookieInfoMapper()
  }

  /**
   * TODO
   **/
  getUrlInfos(url: string): UrlInfos {
    const urlWithoutFirstDot = url.startsWith('.') ? url.substring(1) : url
    const splitUrl = urlWithoutFirstDot.split('.')
    const splitUrlLength = splitUrl.length

    return {
      full: url.startsWith('.') ? url.substring(1) : url,
      domain: url.split('.').slice(-2).join('.'),
    }
  }

  getUrlInfosBulk(urls: string[]): UrlInfos[] {
    return urls.map((scriptDomain) => this.getUrlInfos(scriptDomain))
  }

  findByUrlInfos(urlsList: UrlInfos[], url: UrlInfos): UrlInfos | undefined {
    return urlsList.find(
      (urlInfos) =>
        urlInfos.full === url.domain || urlInfos.domain === url.domain
    )
  }

  associateDomains(
    cookieUrl: UrlInfos,
    scriptsUrls: UrlInfos[]
  ): string | null {
    const urlInfos = this.findByUrlInfos(scriptsUrls, cookieUrl)

    if (urlInfos) {
      return urlInfos.full
    }
    return null
  }

  mapScriptCookies(cookies: Protocol.Network.Cookie[], scriptsSrc: string[]) {
    const scriptsDomain = [
      ...new Set(
        scriptsSrc.filter((src) => src !== '').map((e) => new URL(e).hostname)
      ),
    ]

    const scriptDomainsInfos = this.getUrlInfosBulk(scriptsDomain)
    const scripts: { domain: string; cookies: Protocol.Network.Cookie[] }[] = []

    const remainingScripts = [...scriptsDomain]

    cookies.forEach((cookie) => {
      const scriptDomain = this.associateDomains(
        this.getUrlInfos(cookie.domain),
        scriptDomainsInfos
      )
      if (scriptDomain) {
        const cscEl = scripts.find((e) => e.domain === scriptDomain)
        if (cscEl) {
          cscEl.cookies.push(cookie)
        } else {
          scripts.push({ domain: scriptDomain, cookies: [cookie] })
        }
        const remainingScriptsIndex = remainingScripts.findIndex(
          (rs) => rs === scriptDomain
        )
        if (remainingScriptsIndex !== -1) {
          delete remainingScripts[remainingScriptsIndex]
        }
      } else {
        const cscUkn = scripts.find((e) => e.domain === 'unknown')
        if (cscUkn) {
          cscUkn.cookies.push(cookie)
        } else {
          scripts.push({ domain: 'unknown', cookies: [cookie] })
        }
      }
    })

    return [
      ...scripts,
      ...remainingScripts.map((rs) => ({ domain: rs, cookies: [] })),
    ].filter((e) => e !== undefined)
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
    const start = perf_hooks.performance.now()
    const validUrl = new URL(url)
    const links = await SitemapUtils.getLinks(validUrl, pagesNumber)

    const cookies = await this.extractCookies(validUrl, links)

    const testPath = path.join(process.cwd(), 'test2.json')

    await fs.writeFile(testPath, JSON.stringify(cookies))

    const sortedCookies = this.sortCookies(cookies, validUrl)

    const result = {
      url: url,
      pagesAnalyzed: links.length,
      firstPartyCookies: ArrayUtils.removeDuplicate(
        this.mapper.toEntityBulk(sortedCookies.firstParty)
      ),
      thirdPartyCookies: ArrayUtils.removeDuplicate(
        this.mapper.toEntityBulk(sortedCookies.thirdParty)
      ),
    }
    const end = perf_hooks.performance.now()

    this.generateReport(
      validUrl,
      links,
      {
        firstParty: result.firstPartyCookies,
        thirdParty: result.thirdPartyCookies,
      },
      end - start
    )

    return result
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
          timeoutCookieBanner: true,
          url: page.url(),
          // FIXME I don't know why but the following syntax only return the name : error: err or error: { ...err }
          error: { name: err.name, message: err.message, stack: err.stack },
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

    // We first we delete existing cookies, necessary since we use a single instance of a virtual browser
    const client = await page.target().createCDPSession()
    await client.send('Storage.clearCookies')

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

  /**
   * Log information about what were found during the fetching of the cookies.
   * @param url the url that was analyzed
   * @param links the links that were found
   * @param sortedCookies the cookies that were fetched
   * @param duration the total duration of the scrapping
   */
  generateReport(
    url: URL,
    links: string[],
    sortedCookies: {
      firstParty: CookieInfo[]
      thirdParty: CookieInfo[]
    },
    duration: number
  ) {
    aliasLogger.info({
      reportCookieFetching: true,
      duration: duration,
      url,
      pagesNumber: links.length,
      cookiesTotal:
        sortedCookies.firstParty.length + sortedCookies.thirdParty.length,
      cookiesFirstParty: sortedCookies.firstParty.length,
      cookiesThirdParty: sortedCookies.thirdParty.length,
    })
  }
}
