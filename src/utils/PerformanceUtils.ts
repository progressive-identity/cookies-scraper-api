import Sitemapper from 'sitemapper'

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
   */
  static async getLinks(url: URL): Promise<string[]> {
    const sitemapUrls = await this.getSitemapUrls(url)
    if (sitemapUrls) {
      const links = (
        await Promise.all(
          sitemapUrls.map(async (sitemapUrl) => {
            const sitemap = new Sitemapper({
              url: sitemapUrl,
              requestHeaders: {
                'User-Agent':
                  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:81.0) Gecko/20100101 Firefox/81.0',
              },
            })
            const { sites } = await sitemap.fetch()
            return sites
          })
        )
      ).flat()
      // We return only the first X links
      return links.slice(0, 5)
    } else {
      return [url.origin]
    }
  }
}
