const {join} = require('path');
require('dotenv').config()

/**
 * @type {import("puppeteer").Configuration}
 */
if (process.env.NODE_ENV !== 'development') {
    module.exports = {
        // Changes the cache location for Puppeteer.
        cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
    };
}
