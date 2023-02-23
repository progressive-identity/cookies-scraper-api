export abstract class SitemapUtils {
  // static getSiteMapUrls(url: URL): Promise<URL[] | null> {
  // TODO: rework the url to get the root url if it is not
  // const robotsTxtUrl = `${url}/robots.txt`
  // const res = await fetch(robotsTxtUrl)
  // const txt = await res.text()
  // const sitemapUrls = txt.match(/Sitemap:.*$/gm)
  // if (sitemapUrls && sitemapUrls.length > 0) {
  //   return sitemapUrls.map(
  //     (sitemapUrl) => new URL(sitemapUrl.split('Sitemap:')[1].trim())
  //   )
  // }
  //   return null
  // }

  static getLinks(url: URL): string[] {
    return [url.toString(), url.origin]
  }
}
