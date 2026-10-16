// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.js',
  timeout: 40 * 1000, // maximum time for each test
  expect: {
    timeout: 20 * 1000, // maximum time each expect() assertion keeps retrying
  },
  retries: process.env.CI ? 1 : 0, // one retry on CI, so 'on-first-retry' traces get recorded
  reporter: 'html',

  use: {
    browserName: 'chromium',
    headless: !!process.env.CI, // headed locally, headless on CI servers (which set CI=true)
    timezoneId: 'America/New_York', // the site picks its default date from the browser's clock
    trace: 'on-first-retry',
  },
});
