const {join} = require('path');
require('dotenv').config()

/**
 * In case of error "Could not find Chromium", then just reinstall puppeteer (npm i puppeteer)
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
    // Changes the cache location for Puppeteer.
    cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
