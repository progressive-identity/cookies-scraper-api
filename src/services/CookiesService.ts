// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import puppeteer, { Protocol } from 'puppeteer'
import GetSitemapLinks from 'get-sitemap-links'
import { GetByUrlResData } from '../controllers/types/cookiesType'

export class CookiesService {
  async getCookieInfos(url: string): Promise<GetByUrlResData> {
    // TODO: find the sitemap url automatically
    // TODO: recursively interrogate the sitemap when the sitemap only reference other sitemaps
    // TODO(later): add the possibility to select how many page to check for the cookies
    // TODO: maybe fetch 50% of the page in the limit of 100 pages
    // TODO: test a message queue (rabbitMQ ?) because this function will be slow
    // TODO: find a way to classify the cookies
    // TODO: fetch the root url by default (important)

    // const sitemapUrls = await this.getSiteMapUrls(url)
    // const cookies = await this.extractCookiesFromSiteMaps(sitemapUrls)

    return [
      {
        name: 'string',
        value: 'string',
        duration: 0,
        domain: 'string',
      },
    ]
  }

  async getSiteMapUrls(url: URL): URL[] | null {
    // TODO: rework the url to get the root url if it is not
    const robotsTxtUrl = `${url}/robots.txt`
    const res = await fetch(robotsTxtUrl)
    const txt = await res.text()
    const sitemapUrls = txt.match(/Sitemap:.*$/gm)
    if (sitemapUrls.length > 0) {
      return sitemapUrls.map(
        (sitemapUrl) => new URL(sitemapUrl.split('Sitemap:')[1].trim())
      )
    }
    return null
  }

  async extractCookies(url: URL): Promise<Protocol.Network.Cookie[]> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders({ Referer: 'https://example.com' })
    await page.goto(url, { waitUntil: 'networkidle2' })
    // Get the cookies from the page
    // const cookies = await page.cookies()
    const client = await page.target().createCDPSession()
    const cookies = (await client.send('Network.getAllCookies')).cookies

    await browser.close()
    return cookies
  }

  removeDuplicates(arr: object[], key: string) {
    return [...new Map(arr.map((item) => [item[key], item])).values()]
  }

  async extractCookieFromSiteMap(url: URL): Promise<object[]> {
    const links = await GetSitemapLinks(url.toString())
    console.log('pages number', links.length)
    const cookies = []
    if (links.length) {
      cookies.push(await this.extractCookies(links[0]))
      cookies.push(await this.extractCookies(links[links.length - 1]))
      cookies.push(
        await this.extractCookies(links[Number(Math.round(links.length / 2))])
      )
    }

    return this.removeDuplicates(cookies.flat(), 'name')
  }

  async extractCookiesFromSiteMaps(urls: URL[]): Promise<object[]> {
    const cookies = await Promise.all(
      urls.map((url) => this.extractCookieFromSiteMap(url))
    )
    return this.removeDuplicates(cookies.flat(), 'name')
  }
}
