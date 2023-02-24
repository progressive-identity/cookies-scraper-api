import { downloadListOfUrls } from 'crawlee'

/**
 * TODO
 */
export abstract class SitemapUtils {
  /**
   * TODO
   * @param url
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
   * TODO
   * @param url
   */
  static async getRobotsTxt(url: URL): Promise<string> {
    const res = await fetch(url.origin + '/robots.txt')
    return res.text()
  }

  /**
   * TODO
   * @param url
   * @see {@link https://www.npmjs.com/package/get-sitemap-links} too inefficient (lot of urls missing)
   * @see {@link https://www.npmjs.com/package/sitemapper} efficient (more urls found than crawlee), but way too slow for some sitemaps
   */
  static async getLinks(url: URL): Promise<string[]> {
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
      // We return only the first X links
      return links.slice(0, 10)
    } else {
      return [url.origin]
    }
  }
}
