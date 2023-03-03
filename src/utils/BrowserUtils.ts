import puppeteer, { Browser } from 'puppeteer'
import path from 'path'
import { aliasLogger } from './logging/aliasLogger'

export abstract class BrowserUtils {
  static puppeteerBrowser: Browser

  /**
   * Start a virtual browser with Puppeteer.
   * The browser start with the consent-o-matic extension enabled.
   * @see {@link https://pptr.dev/}
   * @see {@link https://chrome.google.com/webstore/detail/consent-o-matic/mdjildafknihdffpkfmmpnpoiajfjnjd?hl=en}
   */
  static async startBrowser() {
    aliasLogger.info('Starting virtual browser (Puppeteer)')

    const pathToExtension = path.join(
      process.cwd(),
      'extensions/consent-o-matic'
    )

    // Configure browser to enable the consent-o-matic extension
    // see: https://github.com/cavi-au/Consent-O-Matic
    this.puppeteerBrowser = await puppeteer.launch({
      headless: 'new',
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    })

    await this.configureConsentOMatic(this.puppeteerBrowser)
  }

  /**
   * Configure the consent-o-matic Chrome extension to accept all cookies.
   * @param browser the browser on which to configure the extension
   */
  static async configureConsentOMatic(browser: Browser): Promise<void> {
    const page = await browser.newPage()
    await page.goto(
      'chrome-extension://mdjildafknihdffpkfmmpnpoiajfjnjd/options.html'
    )
    await page.$$eval('ul.categorylist li', (els) =>
      els.forEach((el) => el.click())
    )
  }
}
// We start an instance of the browser when starting the application
void BrowserUtils.startBrowser()
