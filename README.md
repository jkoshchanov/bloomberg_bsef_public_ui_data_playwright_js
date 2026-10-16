# Bloomberg SEF Public Website Validation (Playwright)

Automated Playwright test that validates the public end-of-day data page of the Bloomberg SEF (Swap Execution Facility): [data.bloombergsef.com](https://data.bloombergsef.com/).

## What the Test Does

The test (`tests/bloomberg_public_bsef_website_data.js`) runs against the production public site and:

1. Opens the site and verifies the page title and the "End Of Day Data" heading.
2. Confirms the date input is visible and defaults to the **previous business day** (weekends skipped, so on Monday it expects Friday).
3. *(Optional)* If `TRADE_DATE` is set, enters that date, clicks **Search**, waits for the grid data response, and verifies the date was applied.
4. Clicks the **Foreign Exchange** tab, waits for its data response, and verifies the tab is active.
5. Verifies the data grid is visible and that all expected column headers are present.
6. Counts the data rows (excluding the "Aggregated Total" row) and asserts there is at least one.
7. Extracts every grid row and logs it to the console as a table.
8. Logs the footnotes shown below the grid.

The test waits on the site's own data request (`POST /bas/blotdatasvc`) rather than fixed sleeps, so it moves on as soon as the grid data has loaded.

## Prerequisites

- **Node.js** 18 or later
- **npm** (comes with Node.js)

## Installation

```bash
git clone https://github.com/jkoshchanov/bloomberg_bsef_public_ui_data_playwright_js.git
cd bloomberg_bsef_public_ui_data_playwright_js
npm ci
npx playwright install chromium
```

## Running the Tests

### Default run (previous business day)

```bash
npm test
```

### Specific trade date

Set `TRADE_DATE` in `YYYY-MM-DD` format:

```bash
TRADE_DATE=2025-06-13 npm test
```

The test first checks the default date, then switches to the given date and runs the Foreign Exchange grid checks against that day's data. An invalid format (for example `06/13/2025`) fails immediately with a clear error.

On Windows:

```powershell
# PowerShell
$env:TRADE_DATE="2025-06-13"; npm test
```

```cmd
:: cmd
set TRADE_DATE=2025-06-13 && npm test
```

### View the HTML report

```bash
npm run report
```

## Configuration

Settings live in `playwright.config.js`:

| Setting | Value |
|---|---|
| Browser | Chromium |
| Headed mode | Headed locally; headless when the `CI` environment variable is set |
| Time zone | `America/New_York` (the site picks its default date from the browser clock) |
| Test timeout | 40 seconds per test |
| Assertion timeout | 20 seconds per `expect()` |
| Retries | 1 on CI, 0 locally |
| Trace | Recorded on the first retry |
| Reporter | HTML (output in `playwright-report/`) |

## Project Structure

```
bloomberg_bsef_public_ui_data_playwright_js/
├── playwright.config.js                       # Playwright configuration
├── package.json                               # Dependencies and npm scripts
├── tests/
│   └── bloomberg_public_bsef_website_data.js  # Main test
└── utils/
    └── dates.js                               # Previous-business-day helper
```

`playwright-report/` and `test-results/` are generated when the tests run and are not committed.

## Planned Improvements

These are not implemented yet:

- Validate expected trades from per-date JSON files (`test-data/trades/YYYY-MM-DD.json`) against the grid rows.
- Cover the Credit and Interest Rates tabs.
- Run on a schedule in GitHub Actions.
