import { downloadListOfUrls } from 'crawlee'
import { ArrayUtils } from './ArrayUtils'
import { isEmpty } from 'radash'

/**
 * Utilities methods to work with the sitemap of a website.
 * @see {@link https://yoast.com/what-is-an-xml-sitemap-and-why-should-you-have-one/}
 */
export abstract class SitemapUtils {
  /**
   * Extract the urls of the sitemaps of a website. It's found in the robots.txt.
   * @param url the url of the website
   */
  static async getSitemapUrls(url: URL): Promise<string[] | null> {
    const robotsTxt = await this.getRobotsTxt(url)
    const regex = robotsTxt.match(/Sitemap:.*$/gm)
    if (regex && regex.length > 0) {
      return regex.map((pattern) => {
        return pattern.replace('Sitemap:', '')
      })
    } else {
      return null
    }
  }

  /**
   * Return the content of the robots.txt of a website.
   * @param url the url of the website
   * @see {@link https://developers.google.com/search/docs/crawling-indexing/robots/intro}
   */
  static async getRobotsTxt(url: URL): Promise<string> {
    const res = await fetch(url.origin + '/robots.txt')
    return res.text()
  }

  /**
   * Return n urls from a website. The urls are found using the sitemap of the website.
   * If not sitemap is found then we return the origin of the website.
   * Alternative packages (to crawlee) to extract the sitemap are presented below.
   * @param url the url of the website
   * @param numberOfLinks the number of urls we want, 10 by default
   * @see {@link https://www.npmjs.com/package/get-sitemap-links} too inefficient (lot of urls missing)
   * @see {@link https://www.npmjs.com/package/sitemapper} efficient (more urls found than crawlee), but way too slow for some sitemaps
   */
  static async getLinks(url: URL, numberOfLinks?: number): Promise<string[]> {
    const sitemapUrls = await this.getSitemapUrls(url)
    if (sitemapUrls) {
      const links = (
        await Promise.all(
          sitemapUrls.map(async (sitemapUrl) => {
            return downloadListOfUrls({
              url: sitemapUrl,
            })
          })
        )
      ).flat()
      if (isEmpty(links)) {
        return [url.origin]
      }
      if (numberOfLinks) {
        // Maybe use a VE for the default maximum number of pages (?)
        // We return only a sample of the links
        return ArrayUtils.getSample(links, numberOfLinks)
      } else {
        return links
      }
    } else {
      return [url.origin]
    }
  }
}
