// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/** *
 *  @see https://playwright.dev/docs/test-configuration
 */

const config = ({
  testDir: './tests',
    testMatch: '**/*.js',
    timeout: 40 * 1000, // applicable for every step
    expect : {
        timeout: 20 * 1000 // applicable for assertions only
    },
    reporter: 'html',

    use: {

      browserName: 'chromium',
      headless: false,

    trace: 'on-first-retry',
  },


});

module.exports = config