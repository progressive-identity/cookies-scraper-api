// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { HttpControllerUtils } from './HttpControllerUtils'
import { HttpController } from './HttpController'
import { Request, Response } from 'express'
import puppeteer, { Protocol } from 'puppeteer'
import GetSitemapLinks from 'get-sitemap-links'

async function extractCookies(url: URL): Promise<Protocol.Network.Cookie[]> {
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

function removeDuplicates(arr: object[], key: string) {
  return [...new Map(arr.map((item) => [item[key], item])).values()]
}
async function extractCookiesSiteMap(url: URL) {
  const links = await GetSitemapLinks(url.toString())
  console.log('pages number', links.length)
  const cookies = []
  if (links.length) {
    cookies.push(await extractCookies(links[0]))
    cookies.push(await extractCookies(links[links.length - 1]))
    cookies.push(
      await extractCookies(links[Number(Math.round(links.length / 2))])
    )
  }

  return removeDuplicates(cookies.flat(), 'name')
}

export class CookieScrapperController
  implements HttpController<unknown, unknown, unknown, unknown, unknown>
{
  constructor() {}
  create = async (req: Request, res: Response): Promise<void> => {
    // TODO: find the sitemap url automatically
    // TODO: recursively interrogate the sitemap when the sitemap only reference other sitemaps
    // TODO(later): add the possibility to select how many page to check for the cookies
    // TODO: maybe fetch 50% of the page in the limit of 100 pages
    // TODO: test a message queue (rabbitMQ ?) because this function will be slow
    const url = 'https://www.google.com'
    const sitemapUrl = `${url}/sitemap.xml`

    const cookies = await extractCookiesSiteMap(new URL(sitemapUrl))

    console.log('length', cookies.length)
    console.log('cookies', cookies)

    HttpControllerUtils.sendPostResponse<{}>(res, { cookies })
  }
}
