export abstract class SitemapUtils {
  // static getSiteMapUrls(url: URL): Promise<URL[] | null> {
  // TODO: rework the url to get the root url if it is not
  // const robotsTxtUrl = `${url}/robots.txt`
  // const res = await fetch(robotsTxtUrl)
  // const txt = await res.text()
  //
  // if (sitemapUrls && sitemapUrls.length > 0) {
  //   return sitemapUrls.map(
  //     (sitemapUrl) => new URL(sitemapUrl.split('Sitemap:')[1].trim())
  //   )
  // }
  //   return null
  // }

  /**
   * TODO
   * @param url
   */
  static async getSitemapUrl(url: URL): Promise<string | null> {
    const robotsTxt = await this.getRobotsTxt(url)
    const regex = robotsTxt.match(/Sitemap:.*$/gm)
    if (regex && regex.length > 0) {
      regex[0].replace('Sitemap:', '')
      return regex[0]
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
  static getLinks(url: URL): string[] {
    const sitemapUrl = this.getSitemapUrl(url)
    return [url.toString(), url.origin]
  }
}
